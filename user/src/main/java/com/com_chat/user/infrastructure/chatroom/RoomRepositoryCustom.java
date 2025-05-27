package com.com_chat.user.infrastructure.chatroom;

import com.com_chat.user.domain.chatroom.Room;
import com.com_chat.user.domain.chatroom.RoomEnum;

import java.util.List;
import java.util.Optional;

public interface RoomRepositoryCustom {

    List<Room> findRoom(Long loginMemberId, Long otherMemberId, RoomEnum.RoomType type);
}
