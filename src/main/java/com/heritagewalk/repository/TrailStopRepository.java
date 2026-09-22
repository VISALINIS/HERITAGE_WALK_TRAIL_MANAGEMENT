package com.heritagewalk.repository;

import com.heritagewalk.model.TrailStop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrailStopRepository extends JpaRepository<TrailStop, Long> {

    List<TrailStop> findByTrailIdOrderByStopOrderAsc(Long trailId);

    Optional<TrailStop> findByTrailIdAndId(Long trailId, Long stopId);

    void deleteByTrailIdAndId(Long trailId, Long stopId);

    boolean existsByTrailIdAndHeritageSiteId(Long trailId, Long heritageSiteId);
}

