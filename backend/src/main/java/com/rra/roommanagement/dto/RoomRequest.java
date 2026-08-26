package com.rra.roommanagement.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank
    private String roomName;
    @NotNull @Min(1)
    private Integer capacity;
    @NotBlank(message = "Location is required")
    @Pattern(regexp = "Ground|1st Floor|2nd Floor|3rd Floor", message = "Location must be Ground, 1st Floor, 2nd Floor or 3rd Floor")
    private String location;
    @Size(max = 255)
    @Pattern(regexp = "^$|^(?=.*[A-Za-z])[A-Za-z .,'-]+$", message = "Description must be text only, with no numbers")
    private String description;
}
