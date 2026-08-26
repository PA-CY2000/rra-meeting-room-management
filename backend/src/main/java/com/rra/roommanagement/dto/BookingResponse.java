package com.rra.roommanagement.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private Long roomId;
    private String roomName;
    private String purpose;
    private LocalDate startDate;
    private LocalDate endDate;
    private String startTime;
    private String endTime;
    private String status;
    private LocalDateTime createdAt;
    private String approvedByName;
    private LocalDateTime approvedAt;
}
