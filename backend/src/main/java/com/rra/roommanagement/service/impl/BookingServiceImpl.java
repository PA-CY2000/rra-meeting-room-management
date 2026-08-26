package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.BookingRequest;
import com.rra.roommanagement.dto.BookingResponse;
import com.rra.roommanagement.entity.Booking;
import com.rra.roommanagement.entity.Room;
import com.rra.roommanagement.entity.User;
import com.rra.roommanagement.exception.BadRequestException;
import com.rra.roommanagement.exception.ResourceNotFoundException;
import com.rra.roommanagement.repository.BookingRepository;
import com.rra.roommanagement.repository.HolidayRepository;
import com.rra.roommanagement.repository.RoomRepository;
import com.rra.roommanagement.repository.UserRepository;
import com.rra.roommanagement.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }
        LocalDateTime newStart = LocalDateTime.of(request.getStartDate(), request.getStartTime());
        LocalDateTime newEnd = LocalDateTime.of(request.getEndDate(), request.getEndTime());
        if (!newStart.isBefore(newEnd)) {
            throw new BadRequestException("Start time must be before end time.");
        }

        validateNoWeekend(request.getStartDate());
        validateNoWeekend(request.getEndDate());
        validateNoHoliday(request.getStartDate());
        validateNoHoliday(request.getEndDate());

        if (hasTimeOverlap(request.getRoomId(), newStart, newEnd, null)) {
            throw new BadRequestException("This room is already booked for the selected date and hours.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .purpose(request.getPurpose().trim())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created by {} for room {}", userEmail, room.getRoomName());
        return toResponse(saved);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    public BookingResponse getBooking(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public BookingResponse approveBooking(Long id, String adminEmail) {
        Booking booking = findById(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved.");
        }
        LocalDateTime start = toStart(booking);
        LocalDateTime end = toEnd(booking);
        if (hasTimeOverlap(booking.getRoom().getId(), start, end, booking.getId())) {
            throw new BadRequestException("This room is already booked for the selected date and hours.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());
        log.info("Booking {} approved by {}", id, adminEmail);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse rejectBooking(Long id, String adminEmail) {
        Booking booking = findById(id);
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());
        log.info("Booking {} rejected by {}", id, adminEmail);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(Long id, String userEmail) {
        Booking booking = findById(id);
        if (!booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You can only cancel your own bookings.");
        }
        if (booking.getStatus() == Booking.BookingStatus.PENDING) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            log.info("Pending booking {} cancelled by {}", id, userEmail);
            return toResponse(bookingRepository.save(booking));
        }
        if (booking.getStatus() == Booking.BookingStatus.APPROVED) {
            booking.setStatus(Booking.BookingStatus.CANCEL_REQUESTED);
            log.info("Cancel requested for approved booking {} by {}", id, userEmail);
            return toResponse(bookingRepository.save(booking));
        }
        throw new BadRequestException("This booking cannot be cancelled.");
    }

    @Override
    public BookingResponse approveCancel(Long id, String adminEmail) {
        Booking booking = findById(id);
        if (booking.getStatus() != Booking.BookingStatus.CANCEL_REQUESTED) {
            throw new BadRequestException("Only cancel requests can be approved.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());
        log.info("Cancel request {} approved by {}", id, adminEmail);
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse rejectCancel(Long id, String adminEmail) {
        Booking booking = findById(id);
        if (booking.getStatus() != Booking.BookingStatus.CANCEL_REQUESTED) {
            throw new BadRequestException("Only cancel requests can be rejected.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());
        log.info("Cancel request {} rejected by {}", id, adminEmail);
        return toResponse(bookingRepository.save(booking));
    }

    private boolean hasTimeOverlap(Long roomId, LocalDateTime newStart, LocalDateTime newEnd, Long excludeId) {
        List<Booking> candidates = bookingRepository.findBlockingOverlaps(
                roomId, newStart.toLocalDate(), newEnd.toLocalDate());
        return candidates.stream()
                .filter(b -> excludeId == null || !b.getId().equals(excludeId))
                .anyMatch(b -> {
                    LocalDateTime existingStart = toStart(b);
                    LocalDateTime existingEnd = toEnd(b);
                    return existingStart.isBefore(newEnd) && existingEnd.isAfter(newStart);
                });
    }

    private LocalDateTime toStart(Booking b) {
        return LocalDateTime.of(b.getStartDate(), b.getStartTime() != null ? b.getStartTime() : LocalTime.MIN);
    }

    private LocalDateTime toEnd(Booking b) {
        return LocalDateTime.of(b.getEndDate(), b.getEndTime() != null ? b.getEndTime() : LocalTime.MAX);
    }

    private void validateNoWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Weekend bookings are not allowed.");
        }
    }

    private void validateNoHoliday(LocalDate date) {
        if (holidayRepository.existsByDate(date)) {
            throw new BadRequestException("Bookings on public holidays are not allowed.");
        }
    }

    private Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setUserId(b.getUser().getId());
        r.setUserFullName(b.getUser().getFullName());
        r.setRoomId(b.getRoom().getId());
        r.setRoomName(b.getRoom().getRoomName());
        r.setPurpose(b.getPurpose());
        r.setStartDate(b.getStartDate());
        r.setEndDate(b.getEndDate());
        if (b.getStartTime() != null) r.setStartTime(b.getStartTime().format(TIME_FMT));
        if (b.getEndTime() != null) r.setEndTime(b.getEndTime().format(TIME_FMT));
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        if (b.getApprovedBy() != null) r.setApprovedByName(b.getApprovedBy().getFullName());
        r.setApprovedAt(b.getApprovedAt());
        return r;
    }
}
