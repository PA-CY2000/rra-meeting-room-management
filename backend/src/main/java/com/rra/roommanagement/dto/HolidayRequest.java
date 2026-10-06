package com.rra.roommanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

// Data sent from frontend when adding a public holiday
public class HolidayRequest {

    @NotNull
    private LocalDate date;

    @NotBlank
    private String name;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
