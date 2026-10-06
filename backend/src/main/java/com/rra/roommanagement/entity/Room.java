package com.rra.roommanagement.entity;

import jakarta.persistence.*;

// This class represents a meeting room
@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roomName;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    // A room is either available or under maintenance
    public enum RoomStatus {
        AVAILABLE, MAINTENANCE
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
}
