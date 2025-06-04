package com.com_chat.chat.domain.message;

import java.util.Optional;

public interface MessageRepository {
    Optional<Message> findLastMessage(Long roomId);

    Message save(Message message);
}
