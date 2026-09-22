package com.heritagewalk.repository;

import com.heritagewalk.model.Trail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrailRepository extends JpaRepository<Trail, Long> {

    @Query("SELECT DISTINCT t FROM Trail t LEFT JOIN FETCH t.trailStops ts LEFT JOIN FETCH ts.heritageSite ORDER BY t.name ASC")
    List<Trail> findAllWithStops();

    @Query("SELECT t FROM Trail t LEFT JOIN FETCH t.trailStops ts LEFT JOIN FETCH ts.heritageSite WHERE t.id = :id")
    Optional<Trail> findByIdWithStops(@Param("id") Long id);
}

