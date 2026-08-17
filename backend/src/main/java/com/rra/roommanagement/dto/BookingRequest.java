package com.rra.roommanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull
    private Long roomId;
    @NotBlank
    private String purpose;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
}
