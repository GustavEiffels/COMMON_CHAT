package com.com_chat.user.domain.chatroom;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository repository;

// 채팅방 생성
    public DomainRoomDto.CreateInfo create(DomainRoomDto.CreateCommand command){
        if (command.type().equals(RoomEnum.RoomType.PRIVATE)) {
            Long otherId = command.memberIds().get(0);
            List<Room> roomList = repository.findRoom(command.ownerId(), otherId, RoomEnum.RoomType.PRIVATE);

            if (!roomList.isEmpty()) {
                if (roomList.size() == 1) {
                    return DomainRoomDto.CreateInfo.fromDomain(roomList.get(0));
                }
                throw new BaseException(ChatroomException.PRIVATE_MULTI_EXCEPTION);
            }
        }

        Room room = repository.saveRoom(command.toDomain());

        repository.saveParticipants(command.toDomain(room.roomId()));

        return DomainRoomDto.CreateInfo.fromDomain(room);
    }


// 채팅방 나가기
    public DomainRoomDto.ExitInfo goOut(DomainRoomDto.ExitCommand command) {
        Optional<Participant> participantOp = repository.findParticipant(command.ownerId(), command.roomId());

        Optional<Room> optionalRoom = repository.findRoom(command.roomId());

        if (optionalRoom.isEmpty()) {
            throw new BaseException(ChatroomException.NOT_EXIST_ROOM);
        }
        if (participantOp.isEmpty()) {
            throw new BaseException(ChatroomException.NOT_EXIST_PARTICIPANT);
        }

        Participant participant = participantOp.get();

        if (participant.type().equals(RoomEnum.RoomType.MULTI)) {
            repository.saveRoom(optionalRoom.get().changeOwner(command.nextOwnerId()));
        }
        repository.deleteParticipant(participant);

        return DomainRoomDto.ExitInfo.fromDomain(participant);
    }


    public DomainRoomDto.FindRoomInfo find(DomainRoomDto.FindRoomCommand command){
        return DomainRoomDto.FindRoomInfo.fromDomainList(repository.findRoomByMember(command.memberId()));
    }

}
