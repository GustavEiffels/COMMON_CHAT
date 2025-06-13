package com.com_chat.chat.infrastructure.redis;

import com.com_chat.chat.domain.Invitation.Invitation;
import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageException;
import com.com_chat.chat.support.BaseException;
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

    public void sendMessageToClient(String message)  {
        try {

            Message fromMessage = objectMapper.readValue(message, Message.class);
            messageSendingOperations.convertAndSend("/receive/room/"+fromMessage.roomPid(),fromMessage);

        } catch (JsonProcessingException e) {
            throw new BaseException(MessageException.MESSAGE_JSON_CONVERT);
        }
    }

    public void sendInvitationToClient(String message){
        try {

            Invitation invitation = objectMapper.readValue(message, Invitation.class);
            messageSendingOperations.convertAndSend("/invite/to/"+invitation.toMemberId(),invitation);

        } catch (JsonProcessingException e) {
            throw new BaseException(MessageException.MESSAGE_JSON_CONVERT);
        }
    }
}
