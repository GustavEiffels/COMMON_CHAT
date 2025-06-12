package com.com_chat.chat.interfaces.message;

import com.com_chat.chat.domain.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @MessageMapping("/")
    public void send(@RequestBody MessageApiDto.SendMsgRequest request){
        messageService.send(request.toCommand());
    }

    @PostMapping("/message/find")
    public MessageApiDto.FindMessageResponse find(@RequestBody MessageApiDto.FindMessagesRequest request){
        return MessageApiDto.FindMessageResponse.fromInfo(messageService.findMessages(request.toCommand()));
    }
}
