package com.com_chat.user.infrastructure.chatroom;

import com.com_chat.user.infrastructure.chatroom.enttiy.ParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipantJpaRepository extends JpaRepository<ParticipantEntity,Long>, ParticipantRepositoryCustom {
}
