package com.com_chat.chat.domain.message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface MessageRepository {
    Optional<Message> findLastMessage(Long roomId);

    Message save(Message message);

    List<Message> findMessages(Long roomId, Long minRoomCnt);
}
