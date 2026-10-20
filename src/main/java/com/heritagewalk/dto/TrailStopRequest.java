package com.heritagewalk.dto;

import jakarta.validation.constraints.NotNull;

public class TrailStopRequest {

    @NotNull(message = "Heritage site ID is required")
    private Long heritageSiteId;

    private Integer stopOrder;

    public TrailStopRequest() {
    }

    public TrailStopRequest(Long heritageSiteId, Integer stopOrder) {
        this.heritageSiteId = heritageSiteId;
        this.stopOrder = stopOrder;
    }

    public Long getHeritageSiteId() {
        return heritageSiteId;
    }

    public void setHeritageSiteId(Long heritageSiteId) {
        this.heritageSiteId = heritageSiteId;
    }

    public Integer getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
    }
}

