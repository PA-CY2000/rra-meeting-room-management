package com.rra.roommanagement.controller;

import com.rra.roommanagement.dto.ApiResponse;
import com.rra.roommanagement.dto.RoomRequest;
import com.rra.roommanagement.dto.RoomResponse;
import com.rra.roommanagement.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Handles all room-related API requests
@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Room created", roomService.createRoom(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> update(@PathVariable Long id,
                                                             @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Room updated", roomService.updateRoom(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", roomService.getRoom(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("OK", roomService.getAllRooms()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAvailable(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(ApiResponse.success("OK", roomService.getAvailableRooms(startDate, endDate)));
    }
}
