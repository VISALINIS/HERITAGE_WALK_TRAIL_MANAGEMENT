package com.heritagewalk.repository;

import com.heritagewalk.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    List<Feedback> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Feedback> findByHeritageSiteIdOrderByCreatedAtDesc(Long heritageSiteId);

    List<Feedback> findAllByOrderByCreatedAtDesc();

    @Query("SELECT f FROM Feedback f WHERE " +
           "(:siteId IS NULL OR f.heritageSite.id = :siteId) AND " +
           "(:rating IS NULL OR f.rating = :rating) " +
           "ORDER BY f.createdAt DESC")
    List<Feedback> findWithFilters(@Param("siteId") Long siteId, @Param("rating") Integer rating);

    long countByUserId(Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.user.id = :userId")
    Double getAverageRatingByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f")
    Double getOverallAverageRating();

    @Query("SELECT f.rating, COUNT(f) FROM Feedback f GROUP BY f.rating")
    List<Object[]> getRatingDistribution();

    @Query("SELECT h.id, h.name, COUNT(f), COALESCE(AVG(f.rating), 0.0) " +
           "FROM HeritageSite h LEFT JOIN Feedback f ON f.heritageSite.id = h.id " +
           "GROUP BY h.id, h.name ORDER BY COUNT(f) DESC, h.name ASC")
    List<Object[]> getSiteRatingsSummary();
}

