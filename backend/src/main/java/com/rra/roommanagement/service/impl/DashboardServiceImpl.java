package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.DashboardStats;
import com.rra.roommanagement.entity.Booking;
import com.rra.roommanagement.repository.BookingRepository;
import com.rra.roommanagement.repository.RoomRepository;
import com.rra.roommanagement.service.DashboardService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.Set;

// This service provides statistics shown on the admin dashboard
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Set<Booking.BookingStatus> ACTIVE_STATUSES =
            EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED, Booking.BookingStatus.CANCEL_REQUESTED);

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public DashboardServiceImpl(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public DashboardStats getStats() {
        LocalDate today = LocalDate.now();

        long totalRooms = roomRepository.count();

        // Count how many rooms are booked today
        Set<Long> bookedRoomIds = new HashSet<>();
        for (Booking b : bookingRepository.findApprovedOverlappingDate(today, ACTIVE_STATUSES)) {
            bookedRoomIds.add(b.getRoom().getId());
        }
        long bookedToday = bookedRoomIds.size();
        long availableRooms = Math.max(0, totalRooms - bookedToday);

        long pending = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long approved = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);
        long rejected = bookingRepository.countByStatus(Booking.BookingStatus.REJECTED);
        long cancelRequested = bookingRepository.countByStatus(Booking.BookingStatus.CANCEL_REQUESTED);
        long todayBookings = bookingRepository.findTodayBookings(today).size();
        long upcomingBookings = bookingRepository.findUpcomingBookings(today).size();

        DashboardStats stats = new DashboardStats();
        stats.setTotalRooms(totalRooms);
        stats.setAvailableRooms(availableRooms);
        stats.setPendingBookings(pending);
        stats.setApprovedBookings(approved);
        stats.setRejectedBookings(rejected);
        stats.setCancelRequestedBookings(cancelRequested);
        stats.setTodayBookings(todayBookings);
        stats.setUpcomingBookings(upcomingBookings);
        return stats;
    }
}
