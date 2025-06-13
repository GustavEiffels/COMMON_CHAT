package com.com_chat.user.application.room;

import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.RoomEnum;

import java.util.List;

public record FacadeRoomDto() {

    public record CreateCriteria(
            List<Long> memberIds,
            RoomEnum.RoomType type,
            String title
    )
    {

        public DomainRoomDto.CreateCommand toCommand(Long ownerId){
            return new DomainRoomDto.CreateCommand(
                    ownerId,
                    memberIds,
                    type,
                    title
            );
        }
    }

    public record CreateResult(
            Long roomId,
            String title,
            RoomEnum.RoomType type,
            List<Long> memberIds
    )
    {}

}
