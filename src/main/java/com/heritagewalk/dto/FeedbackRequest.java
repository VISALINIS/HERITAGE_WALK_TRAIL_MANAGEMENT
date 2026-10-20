package com.heritagewalk.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {

    @NotNull(message = "Heritage site ID is required")
    private Long heritageSiteId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    @NotBlank(message = "Comment cannot be empty")
    private String comment;

    public FeedbackRequest() {
    }

    public FeedbackRequest(Long heritageSiteId, Integer rating, String comment) {
        this.heritageSiteId = heritageSiteId;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getHeritageSiteId() {
        return heritageSiteId;
    }

    public void setHeritageSiteId(Long heritageSiteId) {
        this.heritageSiteId = heritageSiteId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

