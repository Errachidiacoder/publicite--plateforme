package com.publicity_platform.project.service;

import com.publicity_platform.project.entity.*;
import com.publicity_platform.project.repository.*;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ServiceOffreService serviceOffreService;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public MessageService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          ServiceOffreService serviceOffreService,
                          UtilisateurRepository utilisateurRepository,
                          NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.serviceOffreService = serviceOffreService;
        this.utilisateurRepository = utilisateurRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Conversation sendMessageForService(@NonNull Long serviceId,
                                              @NonNull Long senderId,
                                              @NonNull String content) {
        ServiceOffre service = serviceOffreService.getById(serviceId);
        Utilisateur sender = utilisateurRepository.findById(senderId).orElseThrow();
        Utilisateur receiver = service.getDemandeur();
        if (receiver.getId().equals(senderId)) {
            throw new RuntimeException("Vous ne pouvez pas vous envoyer un message.");
        }
        Conversation conv = conversationRepository
                .findBetweenUsersForService(senderId, receiver.getId(), serviceId)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setService(service);
                    c.setUserA(sender);
                    c.setUserB(receiver);
                    c.setLastAt(LocalDateTime.now());
                    c.setLastMessage("");
                    return conversationRepository.save(c);
                });

        Message m = new Message();
        m.setConversation(conv);
        m.setSender(sender);
        m.setContent(content);
        messageRepository.save(m);

        conv.setLastMessage(content);
        conv.setLastAt(LocalDateTime.now());
        conversationRepository.save(conv);

        notificationService.createNotification(
                receiver,
                "Nouveau message",
                "Vous avez reçu un message au sujet du service '" + service.getTitreService() + "'.",
                "MESSAGE_NOUVEAU",
                null
        );

        return conv;
    }

    @Transactional(readOnly = true)
    public List<Conversation> getMyConversations(@NonNull Long userId) {
        return conversationRepository.findByParticipant(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessages(@NonNull Long conversationId) {
        return messageRepository.findByConversation(conversationId);
    }
}
