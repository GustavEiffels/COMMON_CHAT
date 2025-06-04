package com.com_chat.chat.infrastructure.redis;


import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageException;
import com.com_chat.chat.support.BaseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RedisPublisher {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ChannelTopic chattingTopic;
    private final ChannelTopic inviteTopic;

    public void sendMessageToClient(Message message)  {
        try {
            String toMessage = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(chattingTopic.getTopic(),toMessage);
        } catch (JsonProcessingException e) {
            throw new BaseException(MessageException.MESSAGE_JSON_CONVERT);
        }
    }

}
