package com.heritagewalk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "heritage_sites")
public class HeritageSite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "historical_period", length = 100)
    private String historicalPeriod;

    @Column(name = "architectural_style", length = 100)
    private String architecturalStyle;

    @Column(name = "cultural_significance", columnDefinition = "TEXT")
    private String culturalSignificance;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(precision = 10)
    private Double latitude;

    @Column(precision = 10)
    private Double longitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public HeritageSite() {
    }

    public HeritageSite(String name, String location, String description, String historicalPeriod,
                        String architecturalStyle, String culturalSignificance, String imageUrl,
                        Double latitude, Double longitude) {
        this.name = name;
        this.location = location;
        this.description = description;
        this.historicalPeriod = historicalPeriod;
        this.architecturalStyle = architecturalStyle;
        this.culturalSignificance = culturalSignificance;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

