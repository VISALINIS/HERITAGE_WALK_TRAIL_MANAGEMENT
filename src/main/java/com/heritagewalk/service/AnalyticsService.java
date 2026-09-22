package com.heritagewalk.service;

import com.heritagewalk.dto.DashboardStatsDto;
import com.heritagewalk.dto.RatingDistributionDto;
import com.heritagewalk.dto.SiteRatingAnalyticsDto;
import com.heritagewalk.model.Role;
import com.heritagewalk.repository.FeedbackRepository;
import com.heritagewalk.repository.HeritageSiteRepository;
import com.heritagewalk.repository.TrailRepository;
import com.heritagewalk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private HeritageSiteRepository heritageSiteRepository;

    @Autowired
    private TrailRepository trailRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    public DashboardStatsDto getDashboardStats() {
        long totalSites = heritageSiteRepository.count();
        long totalTrails = trailRepository.count();
        long totalVisitors = userRepository.countByRole(Role.VISITOR);
        long totalFeedback = feedbackRepository.count();

        Double rawAvg = feedbackRepository.getOverallAverageRating();
        double avg = (rawAvg != null) ? Math.round(rawAvg * 10.0) / 10.0 : 0.0;

        return new DashboardStatsDto(totalSites, totalTrails, totalVisitors, totalFeedback, avg);
    }

    public RatingDistributionDto getRatingDistribution() {
        List<Object[]> rows = feedbackRepository.getRatingDistribution();
        Map<Integer, Long> counts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            counts.put(i, 0L);
        }

        long total = 0L;
        for (Object[] row : rows) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = ((Number) row[1]).longValue();
            counts.put(rating, count);
            total += count;
        }

        Double rawAvg = feedbackRepository.getOverallAverageRating();
        double avg = (rawAvg != null) ? Math.round(rawAvg * 10.0) / 10.0 : 0.0;

        return new RatingDistributionDto(
                counts.get(5),
                counts.get(4),
                counts.get(3),
                counts.get(2),
                counts.get(1),
                total,
                avg
        );
    }

    public List<SiteRatingAnalyticsDto> getSiteRatingsAnalytics() {
        List<Object[]> rows = feedbackRepository.getSiteRatingsSummary();
        return rows.stream().map(row -> {
            Long siteId = ((Number) row[0]).longValue();
            String siteName = (String) row[1];
            long count = ((Number) row[2]).longValue();
            Double rawAvg = ((Number) row[3]).doubleValue();
            double avg = (rawAvg != null) ? Math.round(rawAvg * 10.0) / 10.0 : 0.0;
            return new SiteRatingAnalyticsDto(siteId, siteName, count, avg);
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getVisitorStats(Long userId) {
        long feedbackCount = feedbackRepository.countByUserId(userId);
        Double rawAvg = feedbackRepository.getAverageRatingByUserId(userId);
        double avg = (rawAvg != null) ? Math.round(rawAvg * 10.0) / 10.0 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("feedbackCount", feedbackCount);
        stats.put("averageRating", avg);
        return stats;
    }
}

