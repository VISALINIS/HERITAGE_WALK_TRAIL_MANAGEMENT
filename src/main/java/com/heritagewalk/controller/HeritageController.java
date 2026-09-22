package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.HeritageSiteDto;
import com.heritagewalk.service.HeritageSiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/heritage")
public class HeritageController {

    @Autowired
    private HeritageSiteService heritageSiteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HeritageSiteDto>>> getAllSites(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String period) {
        List<HeritageSiteDto> sites = heritageSiteService.getAllSites(search, location, period);
        return ResponseEntity.ok(ApiResponse.ok(sites));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<HeritageSiteDto>>> getFeaturedSites() {
        List<HeritageSiteDto> featured = heritageSiteService.getFeaturedSites();
        return ResponseEntity.ok(ApiResponse.ok(featured));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HeritageSiteDto>> getSiteById(@PathVariable Long id) {
        HeritageSiteDto site = heritageSiteService.getSiteById(id);
        return ResponseEntity.ok(ApiResponse.ok(site));
    }

    @GetMapping("/meta/locations")
    public ResponseEntity<ApiResponse<List<String>>> getLocations() {
        List<String> locations = heritageSiteService.getDistinctLocations();
        return ResponseEntity.ok(ApiResponse.ok(locations));
    }

    @GetMapping("/meta/periods")
    public ResponseEntity<ApiResponse<List<String>>> getPeriods() {
        List<String> periods = heritageSiteService.getDistinctPeriods();
        return ResponseEntity.ok(ApiResponse.ok(periods));
    }
}

