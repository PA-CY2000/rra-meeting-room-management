package com.rra.roommanagement.dto;

import lombok.Data;

@Data
public class RoomResponse {
    private Long id;
    private String roomName;
    private Integer capacity;
    private String location;
    private String description;
    private String status;
    private boolean currentlyBooked;
    private String bookedUntil;
    private String bookedFrom;
    private String bookedFromTime;
    private String bookedUntilTime;
}
