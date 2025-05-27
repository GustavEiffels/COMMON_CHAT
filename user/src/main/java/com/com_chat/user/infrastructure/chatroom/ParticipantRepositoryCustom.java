package com.com_chat.user.infrastructure.chatroom;

import com.com_chat.user.domain.chatroom.Participant;
import com.com_chat.user.domain.chatroom.Room;

import java.util.Optional;

public interface ParticipantRepositoryCustom {
    Optional<Participant> findParticipant(Long memberId, Long roomId);
}
