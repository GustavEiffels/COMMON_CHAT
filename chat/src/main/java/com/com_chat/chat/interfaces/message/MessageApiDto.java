package com.com_chat.chat.interfaces.message;


import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageDomainDto;
import com.com_chat.chat.domain.message.MessageEnum;

import java.util.List;

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


    public record FindMessagesRequest(
            Long roomId,

            int count,
            MessageEnum.LoadType type
    ){
        public MessageDomainDto.FindMessagesCommand toCommand(){
            return new MessageDomainDto.FindMessagesCommand(
                    roomId,count,type
            );
        }
    }


    public record FindMessageResponse(
            Long roomId,
            List<Message> messageList
    ){
        public static FindMessageResponse fromInfo(MessageDomainDto.FindMessageInfo info){
            return new FindMessageResponse(info.roomId(),info.messageList());
        }
    }






}
