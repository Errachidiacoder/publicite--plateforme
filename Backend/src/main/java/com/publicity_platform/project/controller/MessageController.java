package com.publicity_platform.project.controller;

import com.publicity_platform.project.entity.Conversation;
import com.publicity_platform.project.entity.Message;
import com.publicity_platform.project.entity.Utilisateur;
import com.publicity_platform.project.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class MessageController {
    private final MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }

    @PostMapping("/messages/send")
    public ResponseEntity<Conversation> sendMessage(@RequestBody Map<String, String> body,
                                                    @AuthenticationPrincipal Utilisateur user) {
        if (user == null) return ResponseEntity.status(401).build();
        Long serviceId = Long.parseLong(body.get("serviceId"));
        String content = body.getOrDefault("content", "").trim();
        if (content.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(service.sendMessageForService(serviceId, user.getId(), content));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> myConversations(@AuthenticationPrincipal Utilisateur user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getMyConversations(user.getId()));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long id,
                                                     @AuthenticationPrincipal Utilisateur user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(service.getMessages(id));
    }
}
