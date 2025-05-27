package com.com_chat.user.domain.chatroom;

public record Room(
        Long roomId,
        RoomEnum.RoomType type,
        Long ownerId
)
{
    public Room changeOwner(Long newOwnerId){
        return new Room(roomId,type,newOwnerId);
    }
}
