package com.com_chat.user.domain.chatroom;

import java.util.List;
import java.util.Optional;

public interface RoomRepository {

    Optional<Room> findRoom(Long roomId);

    List<Room> findRoomByMember(Long memberId);
    Room saveRoom(Room room);
    List<Room> findRoom(Long loginMemberId, Long otherMemberId, RoomEnum.RoomType type);

   void deleteParticipant(Participant participant);

    Optional<Participant> findParticipant(Long loginMemberId, Long chatRoomId);

    List<Participant> saveParticipants(List<Participant> participants);
}
