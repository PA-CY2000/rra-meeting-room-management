package com.rra.roommanagement.dto;

// This class holds all the numbers shown on the admin dashboard
public class DashboardStats {

    private long totalRooms;
    private long availableRooms;
    private long pendingBookings;
    private long approvedBookings;
    private long rejectedBookings;
    private long cancelRequestedBookings;
    private long todayBookings;
    private long upcomingBookings;

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getAvailableRooms() { return availableRooms; }
    public void setAvailableRooms(long availableRooms) { this.availableRooms = availableRooms; }

    public long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(long pendingBookings) { this.pendingBookings = pendingBookings; }

    public long getApprovedBookings() { return approvedBookings; }
    public void setApprovedBookings(long approvedBookings) { this.approvedBookings = approvedBookings; }

    public long getRejectedBookings() { return rejectedBookings; }
    public void setRejectedBookings(long rejectedBookings) { this.rejectedBookings = rejectedBookings; }

    public long getCancelRequestedBookings() { return cancelRequestedBookings; }
    public void setCancelRequestedBookings(long cancelRequestedBookings) { this.cancelRequestedBookings = cancelRequestedBookings; }

    public long getTodayBookings() { return todayBookings; }
    public void setTodayBookings(long todayBookings) { this.todayBookings = todayBookings; }

    public long getUpcomingBookings() { return upcomingBookings; }
    public void setUpcomingBookings(long upcomingBookings) { this.upcomingBookings = upcomingBookings; }
}
