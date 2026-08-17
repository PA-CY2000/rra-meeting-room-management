package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.RoomRequest;
import com.rra.roommanagement.dto.RoomResponse;
import com.rra.roommanagement.entity.Booking;
import com.rra.roommanagement.entity.Room;
import com.rra.roommanagement.exception.ResourceNotFoundException;
import com.rra.roommanagement.repository.BookingRepository;
import com.rra.roommanagement.repository.RoomRepository;
import com.rra.roommanagement.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.builder()
                .roomName(request.getRoomName())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(parseStatus(request.getStatus()))
                .build();
        Room saved = roomRepository.save(room);
        log.info("Room created: {}", saved.getRoomName());
        return toResponse(saved);
    }

    @Override
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = findById(id);
        room.setRoomName(request.getRoomName());
        room.setCapacity(request.getCapacity());
        room.setLocation(request.getLocation());
        room.setDescription(request.getDescription());
        room.setStatus(parseStatus(request.getStatus()));
        return toResponse(roomRepository.save(room));
    }

    @Override
    public void deleteRoom(Long id) {
        findById(id);
        roomRepository.deleteById(id);
        log.info("Room deleted: {}", id);
    }

    @Override
    public RoomResponse getRoom(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        LocalDate today = LocalDate.now();
        Map<Long, LocalDate> bookedUntilByRoom = new HashMap<>();
        for (Booking booking : bookingRepository.findApprovedOverlappingDate(today)) {
            Long roomId = booking.getRoom().getId();
            LocalDate until = booking.getEndDate();
            bookedUntilByRoom.merge(roomId, until, (a, b) -> a.isAfter(b) ? a : b);
        }
        return roomRepository.findAll().stream().map(room -> {
            RoomResponse response = toResponse(room);
            LocalDate bookedUntil = bookedUntilByRoom.get(room.getId());
            response.setCurrentlyBooked(bookedUntil != null);
            response.setBookedUntil(bookedUntil);
            return response;
        }).toList();
    }

    @Override
    public List<RoomResponse> getAvailableRooms(LocalDate startDate, LocalDate endDate) {
        return roomRepository.findAvailableRooms(startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    private Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    private Room.RoomStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return Room.RoomStatus.AVAILABLE;
        return Room.RoomStatus.valueOf(status.toUpperCase());
    }

    public RoomResponse toResponse(Room room) {
        RoomResponse r = new RoomResponse();
        r.setId(room.getId());
        r.setRoomName(room.getRoomName());
        r.setCapacity(room.getCapacity());
        r.setLocation(room.getLocation());
        r.setDescription(room.getDescription());
        r.setStatus(room.getStatus().name());
        return r;
    }
}
