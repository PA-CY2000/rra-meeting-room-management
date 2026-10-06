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
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoomServiceImpl implements RoomService {

    private static final Set<Booking.BookingStatus> ACTIVE_STATUSES =
            EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED, Booking.BookingStatus.CANCEL_REQUESTED);

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.builder()
                .roomName(request.getRoomName())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(Room.RoomStatus.AVAILABLE)
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
        room.setStatus(Room.RoomStatus.AVAILABLE);
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
        Map<Long, Booking> activeBookingByRoom = new HashMap<>();
        for (Booking booking : bookingRepository.findApprovedOverlappingDate(today, ACTIVE_STATUSES)) {
            Long roomId = booking.getRoom().getId();
            activeBookingByRoom.merge(roomId, booking, (a, b) ->
                a.getEndDate().isAfter(b.getEndDate()) ? a : b);
        }
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");
        return roomRepository.findAll().stream()
                .map(room -> {
                    RoomResponse response = toResponse(room);
                    Booking active = activeBookingByRoom.get(room.getId());
                    if (active != null) {
                        response.setCurrentlyBooked(true);
                        response.setBookedFrom(active.getStartDate().format(dateFmt));
                        response.setBookedUntil(active.getEndDate().format(dateFmt));
                        if (active.getStartTime() != null)
                            response.setBookedFromTime(active.getStartTime().format(timeFmt));
                        if (active.getEndTime() != null)
                            response.setBookedUntilTime(active.getEndTime().format(timeFmt));
                    }
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
