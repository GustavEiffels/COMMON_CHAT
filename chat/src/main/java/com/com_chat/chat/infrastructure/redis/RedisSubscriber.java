package com.com_chat.chat.infrastructure.redis;

import com.com_chat.chat.domain.message.Message;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisSubscriber {

    private final ObjectMapper objectMapper;
    private final SimpMessageSendingOperations messageSendingOperations;

    public void sendMessageToClient(String message) throws JsonProcessingException {
        Message fromMessage = objectMapper.readValue(message,Message.class);
        messageSendingOperations.convertAndSend("/receive/room/"+fromMessage.roomPid(),fromMessage);
    }
}
