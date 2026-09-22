package com.heritagewalk.dto;

public class RatingDistributionDto {

    private long star5;
    private long star4;
    private long star3;
    private long star2;
    private long star1;
    private long total;
    private double average;

    public RatingDistributionDto() {
    }

    public RatingDistributionDto(long star5, long star4, long star3, long star2, long star1, long total, double average) {
        this.star5 = star5;
        this.star4 = star4;
        this.star3 = star3;
        this.star2 = star2;
        this.star1 = star1;
        this.total = total;
        this.average = average;
    }

    public long getStar5() {
        return star5;
    }

    public void setStar5(long star5) {
        this.star5 = star5;
    }

    public long getStar4() {
        return star4;
    }

    public void setStar4(long star4) {
        this.star4 = star4;
    }

    public long getStar3() {
        return star3;
    }

    public void setStar3(long star3) {
        this.star3 = star3;
    }

    public long getStar2() {
        return star2;
    }

    public void setStar2(long star2) {
        this.star2 = star2;
    }

    public long getStar1() {
        return star1;
    }

    public void setStar1(long star1) {
        this.star1 = star1;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public double getAverage() {
        return average;
    }

    public void setAverage(double average) {
        this.average = average;
    }
}

