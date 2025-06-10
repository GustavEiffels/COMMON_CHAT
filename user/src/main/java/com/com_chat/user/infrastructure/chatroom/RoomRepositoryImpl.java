package com.com_chat.user.infrastructure.chatroom;

import com.com_chat.user.domain.chatroom.*;
import com.com_chat.user.infrastructure.chatroom.enttiy.ParticipantEntity;
import com.com_chat.user.infrastructure.chatroom.enttiy.RoomEntity;
import jakarta.servlet.http.Part;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class RoomRepositoryImpl implements RoomRepository {

    private final ParticipantJpaRepository participantJpaRepository;
    private final RoomJpaRepository roomJpaRepository;
    @Override
    public Optional<Room> findRoom(Long roomId) {
        return roomJpaRepository.findById(roomId).map(RoomEntity::toDomain);
    }

    @Override
    public List<Room> findRoomByMember(Long memberId) {
        return roomJpaRepository.findRoomByMemberId(memberId);
    }

    @Override
    public List<DomainRoomDto.FindRoomDto> findRoomByMemberWhenLogin(Long memberId) {
        return roomJpaRepository.findRoomByMemberWhenLogin(memberId);
    }

    @Override
    public Optional<Participant> findParticipant(Long loginMemberId, Long chatRoomId) {
        return participantJpaRepository.findParticipant(loginMemberId,chatRoomId);
    }

    @Override
    public List<Room> findRoom(Long loginMemberId, Long otherMemberId, RoomEnum.RoomType type) {
        return roomJpaRepository.findRoom(loginMemberId,otherMemberId,type);
    }

    @Override
    public void deleteParticipant(Participant participant) {
        ParticipantEntity entity  = ParticipantEntity.fromDomain(participant);
        entity.delete();
        participantJpaRepository.save(entity);
    }


    @Override
    public Room saveRoom(Room room) {
        return roomJpaRepository.save(RoomEntity.fromDomain(room)).toDomain();
    }

    @Override
    public List<Participant> saveParticipants(List<Participant> participants) {
        return participantJpaRepository.saveAll(
                participants.stream().map(ParticipantEntity::fromDomain).toList()
        ).stream().map(ParticipantEntity::toDomain).toList();
    }
}
