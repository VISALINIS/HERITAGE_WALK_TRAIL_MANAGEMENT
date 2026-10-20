package com.heritagewalk.dto;

import com.heritagewalk.model.Feedback;
import java.time.LocalDateTime;

public class FeedbackDto {

    private Long id;
    private Long userId;
    private String userName;
    private Long heritageSiteId;
    private String heritageSiteName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public FeedbackDto() {
    }

    public FeedbackDto(Feedback feedback) {
        if (feedback != null) {
            this.id = feedback.getId();
            this.rating = feedback.getRating();
            this.comment = feedback.getComment();
            this.createdAt = feedback.getCreatedAt();

            if (feedback.getUser() != null) {
                this.userId = feedback.getUser().getId();
                this.userName = feedback.getUser().getName();
            }
            if (feedback.getHeritageSite() != null) {
                this.heritageSiteId = feedback.getHeritageSite().getId();
                this.heritageSiteName = feedback.getHeritageSite().getName();
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

