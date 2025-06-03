package com.com_chat.user.fixture;


import com.com_chat.user.domain.chatroom.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Component
public class RoomFixture {

    private final RoomRepository roomRepository;
    private final RoomService roomService;

    @Transactional
    public Room privateRoom(Long member1, Long member2){
        List<Long> memberIds = new ArrayList<>();
        System.out.println("member1 : "+member1);
        System.out.println("member2 : "+member2);
        memberIds.add(member2);

        DomainRoomDto.CreateCommand command = new DomainRoomDto.CreateCommand(
                member1,
                memberIds,
                RoomEnum.RoomType.PRIVATE
        );

        Long createdRoomId = roomService.create(command).roomId();
        System.out.println("privateRoom - createdRoomId : "+createdRoomId);

        return roomRepository.findRoom(createdRoomId).orElseThrow();
    }


    @Transactional
    public Room multiRoom(Long member1, List<Long>members){
        System.out.println("member1 : "+member1);
        System.out.println("members : "+members);
        DomainRoomDto.CreateCommand command = new DomainRoomDto.CreateCommand(
                member1,
                members,
                RoomEnum.RoomType.MULTI
        );

        Long createdRoomId = roomService.create(command).roomId();
        System.out.println("multiRoom - createdRoomId : "+createdRoomId);

        return roomRepository.findRoom(createdRoomId).orElseThrow();
    }
}
