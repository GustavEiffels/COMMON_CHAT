package com.com_chat.chat.interfaces.Invitation;

import com.com_chat.chat.infrastructure.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class InvitationController {
    private final RedisPublisher sendRedis;
    @MessageMapping("/invite")
    public void send(@RequestBody InvitationApiDto.InviteRequest request){
        System.out.println("INVITE REQUEST : "+request.fromMemberId());
        sendRedis.sendInvitationToClient(request.toDomain());
    }
}
