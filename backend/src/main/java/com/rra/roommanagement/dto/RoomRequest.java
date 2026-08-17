package com.rra.roommanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank
    private String roomName;
    @NotNull @Min(1)
    private Integer capacity;
    @NotBlank
    private String location;
    private String description;
    private String status; // AVAILABLE or MAINTENANCE
}
