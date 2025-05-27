package com.com_chat.user.domain.chatroom;

import java.util.List;
import java.util.Optional;

public interface RoomRepository {

    Optional<Room> findRoom(Long roomId);

    List<Room> findRoom(Long loginMemberId, Long otherMemberId, RoomEnum.RoomType type);

    Room saveRoom(Room room);

    List<Participant> saveParticipants(List<Participant> participants);
}
