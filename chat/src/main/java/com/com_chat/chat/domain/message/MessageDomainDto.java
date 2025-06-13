package com.com_chat.chat.domain.message;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record MessageDomainDto() {

// Create
    public record SendMsgCommand(
            String messageContents,
            Long userPid,
            Long roomPid
    ){
        public Message toDomain(Long msgRoomCnt){
            return new Message(
                    null,
                    msgRoomCnt,
                    messageContents,
                    userPid,
                    roomPid,
                    LocalDateTime.now(),
                    LocalDate.now()
            );
        }
    }

// Find
    public record FindMessagesCommand(
        Long roomId,
        int count,
        MessageEnum.LoadType type
    )
    {}


    public record FindMessageInfo(
            Long roomId,
            List<Message> messageList
    ){}



}
