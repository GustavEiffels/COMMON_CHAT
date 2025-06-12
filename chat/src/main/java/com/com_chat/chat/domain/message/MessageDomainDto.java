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
        List<FindMessage> findMessages
    )
    {}

    public record FindMessage(
            Long roomId,
            int page
    ){}

    public record FindMessageInfo(
            List<MessageInfo> messages
    ){}

    public record MessageInfo(
           Long roomId,
           int currentPage,
           List<Message> messageList

    ){}


// Invite
    public record InviteCommand(
        Long roomPid,
        Long inviterPid,
        Long invitedPid
    ){

    }
}
