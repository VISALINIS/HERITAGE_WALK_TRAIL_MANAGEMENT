package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.TrailDto;
import com.heritagewalk.service.TrailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trails")
public class TrailController {

    @Autowired
    private TrailService trailService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrailDto>>> getAllTrails() {
        List<TrailDto> trails = trailService.getAllTrails();
        return ResponseEntity.ok(ApiResponse.ok(trails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrailDto>> getTrailById(@PathVariable Long id) {
        TrailDto trail = trailService.getTrailById(id);
        return ResponseEntity.ok(ApiResponse.ok(trail));
    }
}

