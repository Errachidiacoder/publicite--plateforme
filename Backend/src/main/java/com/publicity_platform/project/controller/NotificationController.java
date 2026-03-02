package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Notification;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Returns ONLY notifications for the currently authenticated user.
     * The userId in the path is validated against the authenticated principal
     * to prevent users from reading each other's notifications.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(
            @PathVariable Long userId,
            @AuthenticationPrincipal Utilisateur currentUser) {
        // Security check: users can only see their own notifications
        if (currentUser == null || !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    /**
     * Returns the unread count for the currently authenticated user only.
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @PathVariable Long userId,
            @AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser == null || !currentUser.getId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * Marks a notification as read — only if it belongs to the authenticated user.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        // Extra check: ensure this notification actually belongs to the user
        notificationService.markAsReadIfOwner(id, currentUser.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * Shortcut: get MY notifications using the authenticated user's identity (no
     * userId needed).
     */
    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificationService.getNotificationsForUser(currentUser.getId()));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(
            @AuthenticationPrincipal Utilisateur currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(currentUser.getId())));
    }
}
