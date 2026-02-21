package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Notification;
import com.publicity_platform.project.entity.Produit;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    @SuppressWarnings("null")
    public void createNotification(Utilisateur destinataire, String sujet, String message, String type,

            Produit source) {
        Notification notification = Notification.builder()
                .destinataire(destinataire)
                .sujetNotification(sujet)
                .corpsMessage(message)
                .typeEvenement(type)
                .notificationLue(false)
                .dateEnvoi(LocalDateTime.now())
                .produitSource(source)
                .build();
        notificationRepository.save(java.util.Objects.requireNonNull(notification));
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByDestinataireIdOrderByDateEnvoiDesc(userId);
    }

    @Transactional
    @SuppressWarnings("null")
    public void markAsRead(Long notificationId) {

        notificationRepository.findById(java.util.Objects.requireNonNull(notificationId)).ifPresent(n -> {
            n.setNotificationLue(true);
            notificationRepository.save(n);
        });
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByDestinataireIdAndNotificationLueFalse(userId);
    }
}
