package com.com_chat.chat.infrastructure.message;

import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageRepository;
import com.com_chat.chat.infrastructure.message.entity.MessageEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepository {

    private final MessageNoNoRepository noNoRepository;
    @Override
    public Optional<Message> findLastMessage(Long roomId) {
        return noNoRepository.findLatestByRoomPid(roomId);
    }

    @Override
    public Message save(Message message) {
        return noNoRepository.save(MessageEntity.fromDomain(message)).toDomain();
    }
}
