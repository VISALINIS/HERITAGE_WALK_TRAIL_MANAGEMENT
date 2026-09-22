package com.heritagewalk.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class ReorderStopsRequest {

    @NotEmpty(message = "Stop IDs list cannot be empty")
    private List<Long> stopIds;

    public ReorderStopsRequest() {
    }

    public ReorderStopsRequest(List<Long> stopIds) {
        this.stopIds = stopIds;
    }

    public List<Long> getStopIds() {
        return stopIds;
    }

    public void setStopIds(List<Long> stopIds) {
        this.stopIds = stopIds;
    }
}

