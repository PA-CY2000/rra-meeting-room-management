package com.rra.roommanagement.controller;

import com.rra.roommanagement.dto.ApiResponse;
import com.rra.roommanagement.dto.BookingRequest;
import com.rra.roommanagement.dto.BookingResponse;
import com.rra.roommanagement.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingRequest request,
                                                                Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Booking submitted, awaiting approval",
                bookingService.createBooking(request, auth.getName())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAll(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        List<BookingResponse> bookings = isAdmin
                ? bookingService.getAllBookings()
                : bookingService.getMyBookings(auth.getName());
        return ResponseEntity.ok(ApiResponse.success("OK", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("OK", bookingService.getBooking(id)));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<BookingResponse>> approve(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Booking approved",
                bookingService.approveBooking(id, auth.getName())));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<BookingResponse>> reject(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Booking rejected",
                bookingService.rejectBooking(id, auth.getName())));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancel(@PathVariable Long id,
                                                               @RequestBody(required = false) java.util.Map<String, String> body,
                                                               Authentication auth) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.success("Cancel processed",
                bookingService.cancelBooking(id, auth.getName(), reason)));
    }

    @PutMapping("/{id}/approve-cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> approveCancel(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Cancellation approved",
                bookingService.approveCancel(id, auth.getName())));
    }

    @PutMapping("/{id}/reject-cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectCancel(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Cancellation rejected",
                bookingService.rejectCancel(id, auth.getName())));
    }
}
