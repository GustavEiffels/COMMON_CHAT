package com.com_chat.user.fixture;


import com.com_chat.user.application.room.FacadeRoomDto;
import com.com_chat.user.application.room.RoomFacade;
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
    private final RoomFacade roomFacade;

    @Transactional
    public Room privateRoom(Long member1, Long member2){
        List<Long> memberIds = new ArrayList<>();
        System.out.println("member1 : "+member1);
        System.out.println("member2 : "+member2);
        memberIds.add(member2);

        FacadeRoomDto.CreateCriteria criteria = new FacadeRoomDto.CreateCriteria(
                member1,
                memberIds,
                RoomEnum.RoomType.PRIVATE

        );

        Long createdRoomId = roomFacade.createRoom(criteria).roomId();
        System.out.println("privateRoom - createdRoomId : "+createdRoomId);

        return roomRepository.findRoom(createdRoomId).orElseThrow();
    }


    @Transactional
    public Room multiRoom(Long member1, List<Long>members){
        System.out.println("member1 : "+member1);
        System.out.println("members : "+members);

        FacadeRoomDto.CreateCriteria criteria = new FacadeRoomDto.CreateCriteria(
                member1,
                members,
                RoomEnum.RoomType.MULTI
        );

        Long createdRoomId = roomFacade.createRoom(criteria).roomId();
        System.out.println("privateRoom - createdRoomId : "+createdRoomId);

        return roomRepository.findRoom(createdRoomId).orElseThrow();
    }
}
