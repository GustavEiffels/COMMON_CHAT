package com.com_chat.chat.interfaces.message;

import com.com_chat.chat.domain.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @MessageMapping("/send")
    public void send(@RequestBody MessageApiDto.SendMsgRequest request){
        messageService.send(request.toCommand());
    }
}
