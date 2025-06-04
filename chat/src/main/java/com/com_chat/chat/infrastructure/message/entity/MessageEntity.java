package com.com_chat.chat.infrastructure.message.entity;


import com.com_chat.chat.domain.message.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Document("MessageEntity")
@AllArgsConstructor
@RequiredArgsConstructor
public class MessageEntity {

    @Id
    private Long id;
    private Long msgRoomCnt;
    private String messageContents;
    private Long userPid;
    private Long roomPid;
    private LocalDateTime createDateTime;
    private LocalDate createDate;

    public Message toDomain(){
        return new Message(
                id,
                msgRoomCnt,
                messageContents,
                userPid,
                roomPid,
                createDateTime,
                createDate
        );
    }

    public static MessageEntity fromDomain(Message message){
        MessageEntity entity = new MessageEntity();
        entity.id = message.id();
        entity.msgRoomCnt = message.msgRoomCnt();
        entity.userPid    = message.userPid();
        entity.roomPid    = message.roomPid();
        entity.createDateTime  = message.createDateTime();
        entity.createDate = message.createDate();
        return entity;
    }
}
