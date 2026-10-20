package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.ReorderStopsRequest;
import com.heritagewalk.dto.TrailDto;
import com.heritagewalk.dto.TrailStopRequest;
import com.heritagewalk.service.TrailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/trails")
public class AdminTrailController {

    @Autowired
    private TrailService trailService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrailDto>>> getAllTrails() {
        List<TrailDto> list = trailService.getAllTrails();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrailDto>> createTrail(@Valid @RequestBody TrailDto dto) {
        TrailDto created = trailService.createTrail(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Trail created successfully!", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrailDto>> updateTrail(
            @PathVariable Long id,
            @Valid @RequestBody TrailDto dto) {
        TrailDto updated = trailService.updateTrail(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Trail updated successfully!", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTrail(@PathVariable Long id) {
        trailService.deleteTrail(id);
        return ResponseEntity.ok(ApiResponse.ok("Trail deleted successfully!"));
    }

    @PostMapping("/{trailId}/stops")
    public ResponseEntity<ApiResponse<TrailDto>> addStop(
            @PathVariable Long trailId,
            @Valid @RequestBody TrailStopRequest request) {
        TrailDto updatedTrail = trailService.addStop(trailId, request.getHeritageSiteId(), request.getStopOrder());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Stop added to trail successfully!", updatedTrail));
    }

    @DeleteMapping("/{trailId}/stops/{stopId}")
    public ResponseEntity<ApiResponse<TrailDto>> removeStop(
            @PathVariable Long trailId,
            @PathVariable Long stopId) {
        TrailDto updatedTrail = trailService.removeStop(trailId, stopId);
        return ResponseEntity.ok(ApiResponse.ok("Stop removed from trail successfully!", updatedTrail));
    }

    @PutMapping("/{trailId}/stops/reorder")
    public ResponseEntity<ApiResponse<TrailDto>> reorderStops(
            @PathVariable Long trailId,
            @Valid @RequestBody ReorderStopsRequest request) {
        TrailDto updatedTrail = trailService.reorderStops(trailId, request.getStopIds());
        return ResponseEntity.ok(ApiResponse.ok("Stops reordered successfully!", updatedTrail));
    }
}

