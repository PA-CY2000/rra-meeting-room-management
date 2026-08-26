package com.rra.roommanagement.repository;

import com.rra.roommanagement.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatus(Room.RoomStatus status);

    @Query("""
        SELECT r FROM Room r WHERE r.status = 'AVAILABLE'
        AND r.id NOT IN (
            SELECT b.room.id FROM Booking b
            WHERE b.status IN ('PENDING', 'APPROVED', 'CANCEL_REQUESTED')
            AND b.startDate <= :endDate
            AND b.endDate >= :startDate
        )
    """)
    List<Room> findAvailableRooms(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}
