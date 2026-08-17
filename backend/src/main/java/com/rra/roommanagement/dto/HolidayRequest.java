package com.rra.roommanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class HolidayRequest {
    @NotNull
    private LocalDate date;
    @NotBlank
    private String name;
}
