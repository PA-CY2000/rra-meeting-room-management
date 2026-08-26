package com.rra.roommanagement.config;

import com.rra.roommanagement.entity.Holiday;
import com.rra.roommanagement.entity.User;
import com.rra.roommanagement.repository.HolidayRepository;
import com.rra.roommanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HolidayRepository holidayRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        updateBookingStatusConstraint();
        clearRoomMaintenance();
        if (!userRepository.existsByEmail("admin@rra.gov.rw")) {
            userRepository.save(User.builder()
                    .fullName("RRA Administrator")
                    .email("admin@rra.gov.rw")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .role(User.Role.ADMIN)
                    .build());
            log.info("Default admin created: admin@rra.gov.rw / Admin@1234");
        }

        // Official Rwanda public holidays (Presidential Order N° 54/01 of 24/02/2017)
        List<Object[]> holidays = List.of(
            // 2025
            new Object[]{LocalDate.of(2025, 1, 1), "New Year's Day"},
            new Object[]{LocalDate.of(2025, 1, 2), "Day after New Year's Day"},
            new Object[]{LocalDate.of(2025, 2, 1), "National Heroes' Day"},
            new Object[]{LocalDate.of(2025, 3, 31), "Eid al-Fitr"},
            new Object[]{LocalDate.of(2025, 4, 7), "Genocide perpetrated against the Tutsi Memorial Day"},
            new Object[]{LocalDate.of(2025, 4, 18), "Good Friday"},
            new Object[]{LocalDate.of(2025, 4, 21), "Easter Monday"},
            new Object[]{LocalDate.of(2025, 5, 1), "Labour Day"},
            new Object[]{LocalDate.of(2025, 6, 7), "Eid al-Adha"},
            new Object[]{LocalDate.of(2025, 7, 1), "Independence Day"},
            new Object[]{LocalDate.of(2025, 7, 4), "Liberation Day"},
            new Object[]{LocalDate.of(2025, 8, 1), "Umuganura Day"},
            new Object[]{LocalDate.of(2025, 8, 15), "Assumption Day"},
            new Object[]{LocalDate.of(2025, 12, 25), "Christmas Day"},
            new Object[]{LocalDate.of(2025, 12, 26), "Boxing Day"},

            // 2026
            new Object[]{LocalDate.of(2026, 1, 1), "New Year's Day"},
            new Object[]{LocalDate.of(2026, 1, 2), "Day after New Year's Day"},
            new Object[]{LocalDate.of(2026, 2, 1), "National Heroes' Day"},
            new Object[]{LocalDate.of(2026, 3, 20), "Eid al-Fitr"},
            new Object[]{LocalDate.of(2026, 4, 3), "Good Friday"},
            new Object[]{LocalDate.of(2026, 4, 6), "Easter Monday"},
            new Object[]{LocalDate.of(2026, 4, 7), "Genocide perpetrated against the Tutsi Memorial Day"},
            new Object[]{LocalDate.of(2026, 5, 1), "Labour Day"},
            new Object[]{LocalDate.of(2026, 5, 27), "Eid al-Adha"},
            new Object[]{LocalDate.of(2026, 7, 1), "Independence Day"},
            new Object[]{LocalDate.of(2026, 7, 4), "Liberation Day"},
            new Object[]{LocalDate.of(2026, 8, 7), "Umuganura Day"},
            new Object[]{LocalDate.of(2026, 8, 15), "Assumption Day"},
            new Object[]{LocalDate.of(2026, 12, 25), "Christmas Day"},
            new Object[]{LocalDate.of(2026, 12, 26), "Boxing Day"},

            // 2027
            new Object[]{LocalDate.of(2027, 1, 1), "New Year's Day"},
            new Object[]{LocalDate.of(2027, 1, 2), "Day after New Year's Day"},
            new Object[]{LocalDate.of(2027, 2, 1), "National Heroes' Day"},
            new Object[]{LocalDate.of(2027, 3, 10), "Eid al-Fitr"},
            new Object[]{LocalDate.of(2027, 3, 26), "Good Friday"},
            new Object[]{LocalDate.of(2027, 3, 29), "Easter Monday"},
            new Object[]{LocalDate.of(2027, 4, 7), "Genocide perpetrated against the Tutsi Memorial Day"},
            new Object[]{LocalDate.of(2027, 5, 1), "Labour Day"},
            new Object[]{LocalDate.of(2027, 5, 16), "Eid al-Adha"},
            new Object[]{LocalDate.of(2027, 7, 1), "Independence Day"},
            new Object[]{LocalDate.of(2027, 7, 4), "Liberation Day"},
            new Object[]{LocalDate.of(2027, 8, 6), "Umuganura Day"},
            new Object[]{LocalDate.of(2027, 8, 15), "Assumption Day"},
            new Object[]{LocalDate.of(2027, 12, 25), "Christmas Day"},
            new Object[]{LocalDate.of(2027, 12, 26), "Boxing Day"}
        );

        for (Object[] h : holidays) {
            LocalDate date = (LocalDate) h[0];
            String name = (String) h[1];
            holidayRepository.findByDate(date).ifPresentOrElse(existing -> {
                if (!name.equals(existing.getName())) {
                    existing.setName(name);
                    holidayRepository.save(existing);
                }
            }, () -> holidayRepository.save(Holiday.builder().date(date).name(name).build()));
        }
        log.info("Rwanda public holidays seeded.");
    }

    private void updateBookingStatusConstraint() {
        try {
            jdbcTemplate.execute("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check");
            jdbcTemplate.execute(
                "ALTER TABLE bookings ADD CONSTRAINT bookings_status_check "
                + "CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED','CANCEL_REQUESTED'))"
            );
            log.info("Booking status constraint updated.");
        } catch (Exception e) {
            log.warn("Could not update bookings_status_check: {}", e.getMessage());
        }
    }

    private void clearRoomMaintenance() {
        try {
            jdbcTemplate.execute("UPDATE rooms SET status = 'AVAILABLE' WHERE status = 'MAINTENANCE'");
            log.info("Room maintenance status removed.");
        } catch (Exception e) {
            log.warn("Could not clear room maintenance status: {}", e.getMessage());
        }
    }
}
