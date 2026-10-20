package com.heritagewalk.dto;

public class SiteRatingAnalyticsDto {

    private Long heritageSiteId;
    private String heritageSiteName;
    private long feedbackCount;
    private double averageRating;

    public SiteRatingAnalyticsDto() {
    }

    public SiteRatingAnalyticsDto(Long heritageSiteId, String heritageSiteName, long feedbackCount, double averageRating) {
        this.heritageSiteId = heritageSiteId;
        this.heritageSiteName = heritageSiteName;
        this.feedbackCount = feedbackCount;
        this.averageRating = averageRating;
    }

    public Long getHeritageSiteId() {
        return heritageSiteId;
    }

    public void setHeritageSiteId(Long heritageSiteId) {
        this.heritageSiteId = heritageSiteId;
    }

    public String getHeritageSiteName() {
        return heritageSiteName;
    }

    public void setHeritageSiteName(String heritageSiteName) {
        this.heritageSiteName = heritageSiteName;
    }

    public long getFeedbackCount() {
        return feedbackCount;
    }

    public void setFeedbackCount(long feedbackCount) {
        this.feedbackCount = feedbackCount;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}

