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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;

    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        // Rule 3: start must not be after end
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date.");
        }

        // Rule 1: no weekends
        validateNoWeekend(request.getStartDate());
        validateNoWeekend(request.getEndDate());

        // Holiday check
        validateNoHoliday(request.getStartDate());
        validateNoHoliday(request.getEndDate());

        // Rule 2: no double booking
        boolean overlap = bookingRepository.existsOverlappingApprovedBooking(
                request.getRoomId(), request.getStartDate(), request.getEndDate());
        if (overlap) {
            throw new BadRequestException("This room is already booked for the selected dates.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (room.getStatus() == Room.RoomStatus.MAINTENANCE) {
            throw new BadRequestException("This room is currently under maintenance.");
        }

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .purpose(request.getPurpose())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Booking created by {} for room {}", userEmail, room.getRoomName());
        return toResponse(saved);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
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
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        booking.setStatus(Booking.BookingStatus.APPROVED);
        booking.setApprovedBy(admin);
        booking.setApprovedAt(java.time.LocalDateTime.now());
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
        booking.setApprovedAt(java.time.LocalDateTime.now());
        log.info("Booking {} rejected by {}", id, adminEmail);
        return toResponse(bookingRepository.save(booking));
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
        r.setStatus(b.getStatus().name());
        r.setCreatedAt(b.getCreatedAt());
        if (b.getApprovedBy() != null) r.setApprovedByName(b.getApprovedBy().getFullName());
        r.setApprovedAt(b.getApprovedAt());
        return r;
    }
}
