package com.heritagewalk.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trails")
public class Trail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "starting_point", nullable = false, length = 150)
    private String startingPoint;

    @Column(name = "ending_point", nullable = false, length = 150)
    private String endingPoint;

    @Column(nullable = false)
    private Double distance; // in kilometers

    @Column(name = "estimated_duration", nullable = false)
    private Integer estimatedDuration; // in minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Difficulty difficulty = Difficulty.EASY;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @OneToMany(mappedBy = "trail", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stopOrder ASC")
    private List<TrailStop> trailStops = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Trail() {
    }

    public Trail(String name, String description, String startingPoint, String endingPoint,
                 Double distance, Integer estimatedDuration, Difficulty difficulty, String imageUrl) {
        this.name = name;
        this.description = description;
        this.startingPoint = startingPoint;
        this.endingPoint = endingPoint;
        this.distance = distance;
        this.estimatedDuration = estimatedDuration;
        this.difficulty = difficulty;
        this.imageUrl = imageUrl;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStartingPoint() {
        return startingPoint;
    }

    public void setStartingPoint(String startingPoint) {
        this.startingPoint = startingPoint;
    }

    public String getEndingPoint() {
        return endingPoint;
    }

    public void setEndingPoint(String endingPoint) {
        this.endingPoint = endingPoint;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Integer getEstimatedDuration() {
        return estimatedDuration;
    }

    public void setEstimatedDuration(Integer estimatedDuration) {
        this.estimatedDuration = estimatedDuration;
    }

    public Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<TrailStop> getTrailStops() {
        return trailStops;
    }

    public void setTrailStops(List<TrailStop> trailStops) {
        this.trailStops = trailStops;
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

