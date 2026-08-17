package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.DashboardStats;
import com.rra.roommanagement.entity.Booking;
import com.rra.roommanagement.entity.Room;
import com.rra.roommanagement.repository.BookingRepository;
import com.rra.roommanagement.repository.RoomRepository;
import com.rra.roommanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public DashboardStats getStats() {
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.findByStatus(Room.RoomStatus.AVAILABLE).size();
        long maintenanceRooms = roomRepository.findByStatus(Room.RoomStatus.MAINTENANCE).size();
        long pending = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long approved = bookingRepository.countByStatus(Booking.BookingStatus.APPROVED);
        long rejected = bookingRepository.countByStatus(Booking.BookingStatus.REJECTED);
        long today = bookingRepository.findTodayBookings(LocalDate.now()).size();
        long upcoming = bookingRepository.findUpcomingBookings(LocalDate.now()).size();

        return DashboardStats.builder()
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .maintenanceRooms(maintenanceRooms)
                .pendingBookings(pending)
                .approvedBookings(approved)
                .rejectedBookings(rejected)
                .todayBookings(today)
                .upcomingBookings(upcoming)
                .build();
    }
}
