package com.com_chat.user.interfaces.chatroom;

import com.com_chat.user.application.room.FacadeRoomDto;
import com.com_chat.user.domain.chatroom.RoomEnum;

import java.util.List;

public record ApiRoomDto() {
    public record CreateRequest(
        List<Long> memberIds,
        RoomEnum.RoomType type,
        String title
    )
    {
        public FacadeRoomDto.CreateCriteria toCriteria(){
            System.out.println("title : "+title);
            return new FacadeRoomDto.CreateCriteria(memberIds,type,title);
        }
    }

    public record CreateResponse(
            Long roomId,
            String roomTitle,
            RoomEnum.RoomType type

    )
    {
        public static CreateResponse fromResult(
                FacadeRoomDto.CreateResult result
        ){
            return new CreateResponse(result.roomId(), result.title(), result.type());
        }
    }
}
