package com.rra.roommanagement.dto;

import jakarta.validation.constraints.*;

// Data sent from frontend when creating or updating a room
public class RoomRequest {

    @NotBlank
    private String roomName;

    @NotNull
    @Min(1)
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Pattern(regexp = "Ground|1st Floor|2nd Floor|3rd Floor",
             message = "Location must be Ground, 1st Floor, 2nd Floor or 3rd Floor")
    private String location;

    @Size(max = 255)
    @Pattern(regexp = "^$|^(?=.*[A-Za-z])[A-Za-z .,'-]+$",
             message = "Description must be text only, with no numbers")
    private String description;

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
