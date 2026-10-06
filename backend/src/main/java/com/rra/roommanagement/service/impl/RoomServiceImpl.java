package com.rra.roommanagement.service.impl;

import com.rra.roommanagement.dto.RoomRequest;
import com.rra.roommanagement.dto.RoomResponse;
import com.rra.roommanagement.entity.Booking;
import com.rra.roommanagement.entity.Room;
import com.rra.roommanagement.exception.ResourceNotFoundException;
import com.rra.roommanagement.repository.BookingRepository;
import com.rra.roommanagement.repository.RoomRepository;
import com.rra.roommanagement.service.RoomService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RoomServiceImpl implements RoomService {

    // These are the booking statuses that block a room
    private static final Set<Booking.BookingStatus> ACTIVE_STATUSES =
            EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED, Booking.BookingStatus.CANCEL_REQUESTED);

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomServiceImpl(RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    @Override
    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        room.setRoomName(request.getRoomName());
        room.setCapacity(request.getCapacity());
        room.setLocation(request.getLocation());
        room.setDescription(request.getDescription());
        room.setStatus(Room.RoomStatus.AVAILABLE);
        return toResponse(roomRepository.save(room));
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
    }

    @Override
    public RoomResponse getRoom(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public List<RoomResponse> getAllRooms() {
        LocalDate today = LocalDate.now();
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        // Get all bookings that are active today and map them by room id
        Map<Long, Booking> activeBookingByRoom = new HashMap<>();
        for (Booking booking : bookingRepository.findApprovedOverlappingDate(today, ACTIVE_STATUSES)) {
            Long roomId = booking.getRoom().getId();
            // Keep the booking with the latest end date
            if (!activeBookingByRoom.containsKey(roomId) ||
                booking.getEndDate().isAfter(activeBookingByRoom.get(roomId).getEndDate())) {
                activeBookingByRoom.put(roomId, booking);
            }
        }

        // Build response for each room
        return roomRepository.findAll().stream().map(room -> {
            RoomResponse response = toResponse(room);
            Booking active = activeBookingByRoom.get(room.getId());
            if (active != null) {
                response.setCurrentlyBooked(true);
                response.setBookedFrom(active.getStartDate().format(dateFmt));
                response.setBookedUntil(active.getEndDate().format(dateFmt));
                if (active.getStartTime() != null) response.setBookedFromTime(active.getStartTime().format(timeFmt));
                if (active.getEndTime() != null) response.setBookedUntilTime(active.getEndTime().format(timeFmt));
            }
            return response;
        }).toList();
    }

    @Override
    public List<RoomResponse> getAvailableRooms(LocalDate startDate, LocalDate endDate) {
        return roomRepository.findAvailableRooms(startDate, endDate)
                .stream().map(this::toResponse).toList();
    }

    // Find room by id or throw error
    private Room findById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    // Convert Room entity to RoomResponse DTO
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
