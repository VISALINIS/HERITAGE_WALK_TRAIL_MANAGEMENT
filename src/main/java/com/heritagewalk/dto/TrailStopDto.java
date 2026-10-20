package com.heritagewalk.dto;

import com.heritagewalk.model.TrailStop;

public class TrailStopDto {

    private Long id;
    private Integer stopOrder;
    private Long heritageSiteId;
    private String heritageSiteName;
    private String heritageSiteLocation;
    private String heritageSiteImageUrl;
    private String heritageSitePeriod;
    private String heritageSiteStyle;
    private Double latitude;
    private Double longitude;

    public TrailStopDto() {
    }

    public TrailStopDto(TrailStop stop) {
        if (stop != null) {
            this.id = stop.getId();
            this.stopOrder = stop.getStopOrder();
            if (stop.getHeritageSite() != null) {
                this.heritageSiteId = stop.getHeritageSite().getId();
                this.heritageSiteName = stop.getHeritageSite().getName();
                this.heritageSiteLocation = stop.getHeritageSite().getLocation();
                this.heritageSiteImageUrl = stop.getHeritageSite().getImageUrl();
                this.heritageSitePeriod = stop.getHeritageSite().getHistoricalPeriod();
                this.heritageSiteStyle = stop.getHeritageSite().getArchitecturalStyle();
                this.latitude = stop.getHeritageSite().getLatitude();
                this.longitude = stop.getHeritageSite().getLongitude();
            }
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
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

    public String getHeritageSiteLocation() {
        return heritageSiteLocation;
    }

    public void setHeritageSiteLocation(String heritageSiteLocation) {
        this.heritageSiteLocation = heritageSiteLocation;
    }

    public String getHeritageSiteImageUrl() {
        return heritageSiteImageUrl;
    }

    public void setHeritageSiteImageUrl(String heritageSiteImageUrl) {
        this.heritageSiteImageUrl = heritageSiteImageUrl;
    }

    public String getHeritageSitePeriod() {
        return heritageSitePeriod;
    }

    public void setHeritageSitePeriod(String heritageSitePeriod) {
        this.heritageSitePeriod = heritageSitePeriod;
    }

    public String getHeritageSiteStyle() {
        return heritageSiteStyle;
    }

    public void setHeritageSiteStyle(String heritageSiteStyle) {
        this.heritageSiteStyle = heritageSiteStyle;
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
}

