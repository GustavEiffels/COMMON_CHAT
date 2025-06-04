package com.com_chat.chat.infrastructure.message.entity;


import com.com_chat.chat.domain.message.Message;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Document(collection = "Messages")
public class MessageEntity {


    @Id
    private String id;
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
        entity.messageContents = message.messageContents();
        entity.userPid    = message.userPid();
        entity.roomPid    = message.roomPid();
        entity.createDateTime  = message.createDateTime();
        entity.createDate = message.createDate();
        return entity;
    }
}
