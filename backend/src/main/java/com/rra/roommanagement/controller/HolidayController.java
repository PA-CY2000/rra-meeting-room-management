package com.rra.roommanagement.controller;

import com.rra.roommanagement.dto.ApiResponse;
import com.rra.roommanagement.dto.HolidayRequest;
import com.rra.roommanagement.entity.Holiday;
import com.rra.roommanagement.exception.BadRequestException;
import com.rra.roommanagement.exception.ResourceNotFoundException;
import com.rra.roommanagement.repository.HolidayRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayRepository holidayRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Holiday>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("OK", holidayRepository.findAllByOrderByDateAsc()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Holiday>> create(@Valid @RequestBody HolidayRequest request) {
        if (holidayRepository.existsByDate(request.getDate())) {
            throw new BadRequestException("Holiday already exists for this date.");
        }
        Holiday holiday = Holiday.builder().date(request.getDate()).name(request.getName()).build();
        return ResponseEntity.ok(ApiResponse.success("Holiday added", holidayRepository.save(holiday)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));
        holidayRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted", null));
    }
}
