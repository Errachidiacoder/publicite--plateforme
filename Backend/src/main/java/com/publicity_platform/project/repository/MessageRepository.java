package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("select m from Message m where m.conversation.id = :conversationId order by m.createdAt asc")
    List<Message> findByConversation(Long conversationId);
}
