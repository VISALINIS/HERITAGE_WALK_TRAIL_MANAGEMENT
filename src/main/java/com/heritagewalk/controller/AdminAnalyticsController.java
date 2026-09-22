package com.heritagewalk.controller;

import com.heritagewalk.dto.*;
import com.heritagewalk.service.AnalyticsService;
import com.heritagewalk.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminAnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/analytics/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = analyticsService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/analytics/rating-distribution")
    public ResponseEntity<ApiResponse<RatingDistributionDto>> getRatingDistribution() {
        RatingDistributionDto distribution = analyticsService.getRatingDistribution();
        return ResponseEntity.ok(ApiResponse.ok(distribution));
    }

    @GetMapping("/analytics/site-ratings")
    public ResponseEntity<ApiResponse<List<SiteRatingAnalyticsDto>>> getSiteRatings() {
        List<SiteRatingAnalyticsDto> siteRatings = analyticsService.getSiteRatingsAnalytics();
        return ResponseEntity.ok(ApiResponse.ok(siteRatings));
    }

    @GetMapping("/feedback")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getAllFeedback(
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) Integer rating) {
        List<FeedbackDto> feedbackList = feedbackService.getAllFeedbackForAdmin(siteId, rating);
        return ResponseEntity.ok(ApiResponse.ok(feedbackList));
    }

    @GetMapping("/visitor-stats/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getVisitorStats(@PathVariable Long userId) {
        Map<String, Object> stats = analyticsService.getVisitorStats(userId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}

