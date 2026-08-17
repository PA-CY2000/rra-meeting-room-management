package com.rra.roommanagement.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalRooms;
    private long availableRooms;
    private long maintenanceRooms;
    private long pendingBookings;
    private long approvedBookings;
    private long rejectedBookings;
    private long todayBookings;
    private long upcomingBookings;
}
