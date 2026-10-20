package com.heritagewalk.dto;

public class DashboardStatsDto {

    private long totalHeritageSites;
    private long totalTrails;
    private long totalVisitors;
    private long totalFeedback;
    private double averageRating;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalHeritageSites, long totalTrails, long totalVisitors,
                             long totalFeedback, double averageRating) {
        this.totalHeritageSites = totalHeritageSites;
        this.totalTrails = totalTrails;
        this.totalVisitors = totalVisitors;
        this.totalFeedback = totalFeedback;
        this.averageRating = averageRating;
    }

    public long getTotalHeritageSites() {
        return totalHeritageSites;
    }

    public void setTotalHeritageSites(long totalHeritageSites) {
        this.totalHeritageSites = totalHeritageSites;
    }

    public long getTotalTrails() {
        return totalTrails;
    }

    public void setTotalTrails(long totalTrails) {
        this.totalTrails = totalTrails;
    }

    public long getTotalVisitors() {
        return totalVisitors;
    }

    public void setTotalVisitors(long totalVisitors) {
        this.totalVisitors = totalVisitors;
    }

    public long getTotalFeedback() {
        return totalFeedback;
    }

    public void setTotalFeedback(long totalFeedback) {
        this.totalFeedback = totalFeedback;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}

