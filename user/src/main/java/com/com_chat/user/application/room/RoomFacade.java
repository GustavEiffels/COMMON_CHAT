package com.com_chat.user.application.room;


import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.Participant;
import com.com_chat.user.domain.chatroom.RoomEnum;
import com.com_chat.user.domain.chatroom.RoomService;
import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomFacade {

    private final RoomService roomService;
    private final MemberService memberService;

    @Transactional
    public FacadeRoomDto.CreateResult createRoom(FacadeRoomDto.CreateCriteria criteria){

        // Define Member
        Long loginMemberId = memberService.findAuthenticationMember().memberId();
        System.out.println(criteria.memberIds());

        DomainMemberDto.MemberNickInfo memberInfo  = memberService.findMemberInfo(criteria.memberIds());

        // Create Room
        DomainRoomDto.CreateInfo        roomInfo   = roomService.create(criteria.toCommand(loginMemberId));

        // IF CREATE NEW ? -> CREATE PARTICIPANT
        if( roomInfo.createFlag().equals(RoomEnum.CreateFlag.NEW) ){
            // Nick Dto
            Map<Long, String> nickInfo = memberInfo.memberDtoList().stream()
                    .collect(Collectors.toMap(
                            DomainMemberDto.MemberNickDto::memberId,
                            DomainMemberDto.MemberNickDto::nick,
                            (oldValue, newValue) -> oldValue,
                            HashMap::new
                    ));

            // Create Participant
            roomService.createRelation(new DomainRoomDto.CreateRelationCommand(
                    roomInfo.roomId(),
                    loginMemberId,
                    criteria.title(),
                    criteria.memberIds(),
                    nickInfo,
                    roomInfo.type()
            ));
        }

        // Find Room Participant
        Participant participant = roomService.findParticipant(loginMemberId, roomInfo.roomId());

        return new FacadeRoomDto.CreateResult(
                roomInfo.roomId(),
                participant.roomTitle(),
                roomInfo.type(),
                criteria.memberIds()
                );
    }
}
