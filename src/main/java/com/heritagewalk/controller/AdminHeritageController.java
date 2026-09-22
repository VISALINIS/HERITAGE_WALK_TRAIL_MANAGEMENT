package com.heritagewalk.controller;

import com.heritagewalk.dto.ApiResponse;
import com.heritagewalk.dto.HeritageSiteDto;
import com.heritagewalk.service.HeritageSiteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/heritage")
public class AdminHeritageController {

    @Autowired
    private HeritageSiteService heritageSiteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<HeritageSiteDto>>> getAllSites() {
        List<HeritageSiteDto> sites = heritageSiteService.getAllSites(null, null, null);
        return ResponseEntity.ok(ApiResponse.ok(sites));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HeritageSiteDto>> createSite(@Valid @RequestBody HeritageSiteDto dto) {
        HeritageSiteDto created = heritageSiteService.createSite(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Heritage site created successfully!", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HeritageSiteDto>> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody HeritageSiteDto dto) {
        HeritageSiteDto updated = heritageSiteService.updateSite(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Heritage site updated successfully!", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSite(@PathVariable Long id) {
        heritageSiteService.deleteSite(id);
        return ResponseEntity.ok(ApiResponse.ok("Heritage site deleted successfully!"));
    }
}

