package com.heritagewalk.model;

import jakarta.persistence.*;

@Entity
@Table(name = "trail_stops")
public class TrailStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trail_id", nullable = false)
    private Trail trail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "heritage_site_id", nullable = false)
    private HeritageSite heritageSite;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    public TrailStop() {
    }

    public TrailStop(Trail trail, HeritageSite heritageSite, Integer stopOrder) {
        this.trail = trail;
        this.heritageSite = heritageSite;
        this.stopOrder = stopOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trail getTrail() {
        return trail;
    }

    public void setTrail(Trail trail) {
        this.trail = trail;
    }

    public HeritageSite getHeritageSite() {
        return heritageSite;
    }

    public void setHeritageSite(HeritageSite heritageSite) {
        this.heritageSite = heritageSite;
    }

    public Integer getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
    }
}

