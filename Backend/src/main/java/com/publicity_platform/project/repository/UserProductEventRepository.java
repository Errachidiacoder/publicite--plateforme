package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.UserProductEvent;
import com.publicity_platform.project.enumm.EventType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserProductEventRepository extends JpaRepository<UserProductEvent, Long> {

        List<UserProductEvent> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

        boolean existsByUserIdAndProduitIdAndEventType(Long userId, Long produitId, EventType eventType);

        /** Distinct produit IDs viewed by this user (most recent first, limited) */
        @Query("SELECT DISTINCT e.produitId FROM UserProductEvent e WHERE e.userId = :userId " +
                        "AND e.eventType = 'VIEW' ORDER BY MAX(e.createdAt) DESC")
        List<Long> findRecentlyViewedProduitIds(@Param("userId") Long userId, Pageable pageable);

        /**
         * Category IDs the user interacted with most (via favorised / carted products)
         */
        @Query("SELECT p.categorie.id, COUNT(e) AS cnt FROM UserProductEvent e " +
                        "JOIN Produit p ON p.id = e.produitId " +
                        "WHERE e.userId = :userId " +
                        "GROUP BY p.categorie.id ORDER BY cnt DESC")
        List<Object[]> findPreferredCategoryIds(@Param("userId") Long userId, Pageable pageable);
}
