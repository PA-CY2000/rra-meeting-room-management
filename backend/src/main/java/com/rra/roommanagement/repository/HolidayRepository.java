package com.rra.roommanagement.repository;

import com.rra.roommanagement.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    boolean existsByDate(LocalDate date);
    Optional<Holiday> findByDate(LocalDate date);
    List<Holiday> findAllByOrderByDateAsc();
}
