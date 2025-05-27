package com.com_chat.user.domain.chatroom;

public record Room(
        Long roomId,
        RoomEnum.RoomType type,
        Long ownerId
)
{}
