package com.com_chat.chat.domain.message;

import com.com_chat.chat.infrastructure.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository repository;
    private final RedisPublisher sendRedis;

    public void send(MessageDomainDto.SendMsgCommand command){

        Optional<Message> message = repository.findLastMessage(command.roomPid());

        Message createMessage = repository.save(command.toDomain(message.map(value -> value.msgRoomCnt() + 1).orElse(1L)));

        sendRedis.sendMessageToClient(createMessage);
    }


    public MessageDomainDto.FindMessageInfo findMessages(MessageDomainDto.FindMessagesCommand command){
        return new MessageDomainDto.FindMessageInfo(
                command.findMessages().stream().map(findMessage ->{
                            Page<Message> pageResult = repository.findMessages(
                                    findMessage.roomId(),
                                    PageRequest.of(findMessage.page(), 10)
                            );
                            return new MessageDomainDto.MessageInfo(findMessage.roomId(), findMessage.page(),pageResult.toList());
                        }
                ).toList()
        );
    }

}
