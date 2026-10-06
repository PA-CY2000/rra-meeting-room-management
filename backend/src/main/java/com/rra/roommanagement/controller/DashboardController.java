package com.rra.roommanagement.controller;

import com.rra.roommanagement.dto.ApiResponse;
import com.rra.roommanagement.dto.DashboardStats;
import com.rra.roommanagement.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Returns statistics for the admin dashboard
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<DashboardStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("OK", dashboardService.getStats()));
    }
}
