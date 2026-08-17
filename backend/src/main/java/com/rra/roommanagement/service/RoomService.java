package com.rra.roommanagement.service;

import com.rra.roommanagement.dto.RoomRequest;
import com.rra.roommanagement.dto.RoomResponse;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    RoomResponse createRoom(RoomRequest request);
    RoomResponse updateRoom(Long id, RoomRequest request);
    void deleteRoom(Long id);
    RoomResponse getRoom(Long id);
    List<RoomResponse> getAllRooms();
    List<RoomResponse> getAvailableRooms(LocalDate startDate, LocalDate endDate);
}
