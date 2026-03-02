package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.Notification;
import com.publicity_platform.project.entity.Anonce;
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

            Anonce source) {
        Notification notification = Notification.builder()
                .destinataire(destinataire)
                .sujetNotification(sujet)
                .corpsMessage(message)
                .typeEvenement(type)
                .notificationLue(false)
                .dateEnvoi(LocalDateTime.now())
                .anonceSource(source)
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

    /**
     * Marks a notification as read ONLY if it belongs to the given user.
     * Prevents a user from marking another user's notification as read.
     */
    @Transactional
    public void markAsReadIfOwner(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getDestinataire() != null && n.getDestinataire().getId().equals(userId)) {
                n.setNotificationLue(true);
                notificationRepository.save(n);
            }
        });
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByDestinataireIdAndNotificationLueFalse(userId);
    }
}
