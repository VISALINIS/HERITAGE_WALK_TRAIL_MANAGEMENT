package com.heritagewalk.dto;

import com.heritagewalk.model.HeritageSite;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class HeritageSiteDto {

    private Long id;

    @NotBlank(message = "Site name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    private String historicalPeriod;
    private String architecturalStyle;
    private String culturalSignificance;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private Double averageRating = 0.0;
    private Long feedbackCount = 0L;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HeritageSiteDto() {
    }

    public HeritageSiteDto(HeritageSite site) {
        if (site != null) {
            this.id = site.getId();
            this.name = site.getName();
            this.location = site.getLocation();
            this.description = site.getDescription();
            this.historicalPeriod = site.getHistoricalPeriod();
            this.architecturalStyle = site.getArchitecturalStyle();
            this.culturalSignificance = site.getCulturalSignificance();
            this.imageUrl = site.getImageUrl();
            this.latitude = site.getLatitude();
            this.longitude = site.getLongitude();
            this.createdAt = site.getCreatedAt();
            this.updatedAt = site.getUpdatedAt();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHistoricalPeriod() {
        return historicalPeriod;
    }

    public void setHistoricalPeriod(String historicalPeriod) {
        this.historicalPeriod = historicalPeriod;
    }

    public String getArchitecturalStyle() {
        return architecturalStyle;
    }

    public void setArchitecturalStyle(String architecturalStyle) {
        this.architecturalStyle = architecturalStyle;
    }

    public String getCulturalSignificance() {
        return culturalSignificance;
    }

    public void setCulturalSignificance(String culturalSignificance) {
        this.culturalSignificance = culturalSignificance;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getFeedbackCount() {
        return feedbackCount;
    }

    public void setFeedbackCount(Long feedbackCount) {
        this.feedbackCount = feedbackCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

