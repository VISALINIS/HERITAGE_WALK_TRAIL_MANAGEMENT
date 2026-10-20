package com.heritagewalk.repository;

import com.heritagewalk.model.HeritageSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeritageSiteRepository extends JpaRepository<HeritageSite, Long> {

    @Query("SELECT h FROM HeritageSite h WHERE " +
           "(:search IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:location IS NULL OR :location = '' OR LOWER(h.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:period IS NULL OR :period = '' OR LOWER(h.historicalPeriod) LIKE LOWER(CONCAT('%', :period, '%'))) " +
           "ORDER BY h.name ASC")
    List<HeritageSite> searchSites(@Param("search") String search,
                                   @Param("location") String location,
                                   @Param("period") String period);

    @Query("SELECT DISTINCT h.location FROM HeritageSite h WHERE h.location IS NOT NULL ORDER BY h.location ASC")
    List<String> findDistinctLocations();

    @Query("SELECT DISTINCT h.historicalPeriod FROM HeritageSite h WHERE h.historicalPeriod IS NOT NULL ORDER BY h.historicalPeriod ASC")
    List<String> findDistinctPeriods();

    List<HeritageSite> findTop6ByOrderByCreatedAtDesc();
}

