package com.rra.roommanagement.repository;

import com.rra.roommanagement.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByStatus(Booking.BookingStatus status);

    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status = 'APPROVED'
        AND b.startDate <= :endDate
        AND b.endDate >= :startDate
    """)
    boolean existsOverlappingApprovedBooking(@Param("roomId") Long roomId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);

    long countByStatus(Booking.BookingStatus status);

    @Query("""
        SELECT b FROM Booking b JOIN FETCH b.room
        WHERE b.status = 'APPROVED'
        AND b.startDate <= :date
        AND b.endDate >= :date
    """)
    List<Booking> findApprovedOverlappingDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.startDate = :today")
    List<Booking> findTodayBookings(@Param("today") LocalDate today);

    @Query("SELECT b FROM Booking b WHERE b.startDate > :today ORDER BY b.startDate ASC")
    List<Booking> findUpcomingBookings(@Param("today") LocalDate today);
}
