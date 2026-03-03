package com.publicity_platform.project.repository;

import com.publicity_platform.project.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("select c from Conversation c where (c.userA.id = :userId or c.userB.id = :userId) order by c.lastAt desc")
    List<Conversation> findByParticipant(Long userId);

    @Query("select c from Conversation c where ((c.userA.id = :u1 and c.userB.id = :u2) or (c.userA.id = :u2 and c.userB.id = :u1)) and c.service.id = :serviceId")
    Optional<Conversation> findBetweenUsersForService(Long u1, Long u2, Long serviceId);
}
