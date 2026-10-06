package com.rra.roommanagement.service;

import com.rra.roommanagement.dto.BookingRequest;
import com.rra.roommanagement.dto.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request, String userEmail);
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getMyBookings(String userEmail);
    BookingResponse getBooking(Long id);
    BookingResponse approveBooking(Long id, String adminEmail);
    BookingResponse rejectBooking(Long id, String adminEmail);
    BookingResponse cancelBooking(Long id, String userEmail, String reason);
    BookingResponse approveCancel(Long id, String adminEmail);
    BookingResponse rejectCancel(Long id, String adminEmail);
}
