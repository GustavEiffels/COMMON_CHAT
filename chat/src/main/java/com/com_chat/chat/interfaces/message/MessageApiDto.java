package com.com_chat.chat.interfaces.message;


import com.com_chat.chat.domain.message.MessageDomainDto;

public record MessageApiDto() {

    public record SendMsgRequest(
            String messageContents,
            Long userPid,
            Long roomPid
    ){
        public MessageDomainDto.SendMsgCommand toCommand(){
            return new MessageDomainDto.SendMsgCommand(
                    messageContents,
                    userPid,
                    roomPid
            );
        }
    }


}
