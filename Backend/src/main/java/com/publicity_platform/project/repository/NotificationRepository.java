package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireIdOrderByDateEnvoiDesc(Long destinataireId);

    long countByDestinataireIdAndNotificationLueFalse(Long destinataireId);
}
