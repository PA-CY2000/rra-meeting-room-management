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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    // Statuses that block a room from being double-booked
    private static final Set<Booking.BookingStatus> BLOCKING_STATUSES =
            EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED, Booking.BookingStatus.CANCEL_REQUESTED);

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    public BookingServiceImpl(BookingRepository bookingRepository, RoomRepository roomRepository,
                               UserRepository userRepository, HolidayRepository holidayRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.holidayRepository = holidayRepository;
    }

    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        // Validate dates
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        LocalDateTime newStart = LocalDateTime.of(request.getStartDate(), request.getStartTime());
        LocalDateTime newEnd = LocalDateTime.of(request.getEndDate(), request.getEndTime());

        if (!newStart.isBefore(newEnd)) {
            throw new BadRequestException("Start time must be before end time.");
        }

        // Check no weekend or holiday
        validateNoWeekend(request.getStartDate());
        validateNoWeekend(request.getEndDate());
        validateNoHoliday(request.getStartDate());
        validateNoHoliday(request.getEndDate());

        // Check room is not already booked for this time
        if (hasTimeOverlap(request.getRoomId(), newStart, newEnd, null)) {
            throw new BadRequestException("This room is already booked for the selected date and hours.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        // Create and save the booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setPurpose(request.getPurpose().trim());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
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
        // Check no overlap before approving
        if (hasTimeOverlap(booking.getRoom().getId(), toStart(booking), toEnd(booking), booking.getId())) {
            throw new BadRequestException("This room is already booked for the selected date and hours.");
        }
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(LocalDateTime.now());
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
        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(Long id, String userEmail, String reason) {
        Booking booking = findById(id);
        if (!booking.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new BadRequestException("You can only cancel your own bookings.");
        }
        if (reason != null && !reason.isBlank()) {
            booking.setCancelReason(reason.trim());
        }
        // Pending bookings are cancelled immediately
        if (booking.getStatus() == Booking.BookingStatus.PENDING) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            return toResponse(bookingRepository.save(booking));
        }
        // Approved bookings need admin approval to cancel
        if (booking.getStatus() == Booking.BookingStatus.APPROVED) {
            booking.setStatus(Booking.BookingStatus.CANCEL_REQUESTED);
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
        return toResponse(bookingRepository.save(booking));
    }

    // Check if a room is already booked for the given time range
    private boolean hasTimeOverlap(Long roomId, LocalDateTime newStart, LocalDateTime newEnd, Long excludeId) {
        List<Booking> existing = bookingRepository.findBlockingOverlaps(
                roomId, newStart.toLocalDate(), newEnd.toLocalDate(), BLOCKING_STATUSES);
        for (Booking b : existing) {
            if (excludeId != null && b.getId().equals(excludeId)) continue;
            LocalDateTime existStart = toStart(b);
            LocalDateTime existEnd = toEnd(b);
            if (existStart.isBefore(newEnd) && existEnd.isAfter(newStart)) {
                return true;
            }
        }
        return false;
    }

    private LocalDateTime toStart(Booking b) {
        LocalTime time = b.getStartTime() != null ? b.getStartTime() : LocalTime.MIN;
        return LocalDateTime.of(b.getStartDate(), time);
    }

    private LocalDateTime toEnd(Booking b) {
        LocalTime time = b.getEndTime() != null ? b.getEndTime() : LocalTime.MAX;
        return LocalDateTime.of(b.getEndDate(), time);
    }

    // Reject if date falls on weekend
    private void validateNoWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        if (day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY) {
            throw new BadRequestException("Weekend bookings are not allowed.");
        }
    }

    // Reject if date is a public holiday
    private void validateNoHoliday(LocalDate date) {
        if (holidayRepository.existsByDate(date)) {
            throw new BadRequestException("Bookings on public holidays are not allowed.");
        }
    }

    private Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    // Convert Booking entity to BookingResponse DTO
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
        r.setCancelReason(b.getCancelReason());
        r.setCreatedAt(b.getCreatedAt());
        if (b.getApprovedBy() != null) r.setApprovedByName(b.getApprovedBy().getFullName());
        r.setApprovedAt(b.getApprovedAt());
        return r;
    }
}
