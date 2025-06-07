package com.com_chat.user.application.room;

import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.RoomEnum;

import java.util.List;

public record FacadeRoomDto() {

    public record CreateCriteria(
            Long ownerId,
            List<Long> memberIds,
            RoomEnum.RoomType type
    )
    {

        public DomainRoomDto.CreateCommand toCommand(){
            return new DomainRoomDto.CreateCommand(
                    ownerId,
                    memberIds,
                    type
            );
        }
    }

    public record CreateResult(
            Long roomId
    )
    {}

}
