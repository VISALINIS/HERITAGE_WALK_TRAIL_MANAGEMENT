package com.heritagewalk.dto;

import com.heritagewalk.model.Difficulty;
import com.heritagewalk.model.Trail;
import com.heritagewalk.model.TrailStop;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TrailDto {

    private Long id;

    @NotBlank(message = "Trail name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Starting point is required")
    private String startingPoint;

    @NotBlank(message = "Ending point is required")
    private String endingPoint;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be greater than zero")
    private Double distance;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than zero")
    private Integer estimatedDuration;

    private Difficulty difficulty = Difficulty.EASY;
    private String imageUrl;
    private List<TrailStopDto> stops = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TrailDto() {
    }

    public TrailDto(Trail trail) {
        if (trail != null) {
            this.id = trail.getId();
            this.name = trail.getName();
            this.description = trail.getDescription();
            this.startingPoint = trail.getStartingPoint();
            this.endingPoint = trail.getEndingPoint();
            this.distance = trail.getDistance();
            this.estimatedDuration = trail.getEstimatedDuration();
            this.difficulty = trail.getDifficulty();
            this.imageUrl = trail.getImageUrl();
            this.createdAt = trail.getCreatedAt();
            this.updatedAt = trail.getUpdatedAt();

            if (trail.getTrailStops() != null) {
                this.stops = trail.getTrailStops().stream()
                        .map(TrailStopDto::new)
                        .collect(Collectors.toList());
            }
        }
    }

    public TrailDto(Trail trail, List<TrailStop> stops) {
        this(trail);
        if (stops != null) {
            this.stops = stops.stream()
                    .map(TrailStopDto::new)
                    .collect(Collectors.toList());
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

    public List<TrailStopDto> getStops() {
        return stops;
    }

    public void setStops(List<TrailStopDto> stops) {
        this.stops = stops;
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

