package com.com_chat.chat.interfaces.message;


import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageDomainDto;

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
            List<FindMessageDto> findMessages
    ){
        public MessageDomainDto.FindMessagesCommand toCommand(){
            return new MessageDomainDto.FindMessagesCommand(
                    findMessages.stream().map(FindMessageDto::toCommand)
                            .toList()
            );
        }
    }

    public record FindMessageDto(
            Long roomId,
            int page
    ){
        public MessageDomainDto.FindMessage toCommand(){
            return new  MessageDomainDto.FindMessage(
                    roomId,
                    page
            );
        }
    }

    public record FindMessageResponse(
        List<MessageInfoDto> messages
    ){
        public static FindMessageResponse fromInfo(
                MessageDomainDto.FindMessageInfo info
        ){
            return new FindMessageResponse(
                    info.messages().stream().map(MessageInfoDto::fromInfo)
                            .toList()
            );
        }
    }

    public record MessageInfoDto(
            Long roomId,
            int currentPage,
            List<Message> messageList
    ){
        public static MessageInfoDto fromInfo(
                MessageDomainDto.MessageInfo info
        ){
            return new MessageInfoDto(
                    info.roomId(),
                    info.currentPage(),
                    info.messageList()
            );
        }
    }






}
