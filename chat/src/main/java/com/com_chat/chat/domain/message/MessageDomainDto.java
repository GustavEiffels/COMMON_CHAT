package com.com_chat.chat.domain.message;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

// Invite
    public record InviteCommand(
        Long roomPid,
        Long inviterPid,
        Long invitedPid
    ){

    }
}
