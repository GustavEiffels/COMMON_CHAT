package com.com_chat.user.domain.chatroom;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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

    public void createRelation(DomainRoomDto.CreateRelationCommand command){
        List<Participant> participants = new ArrayList<>();

        if( command.roomType().equals(RoomEnum.RoomType.PRIVATE) ){
            command.participants().forEach(memberId->{
                String roomTitle = "";
                for(Long id : command.memberNickInfo().keySet() ){
                    if(!id.equals(memberId)){
                        roomTitle = command.memberNickInfo().get(id);
                    }
                }
                participants.add(
                        Participant.create(
                                memberId,
                                command.roomId(),
                                roomTitle,
                                RoomEnum.RoomType.PRIVATE
                        )
                );
            });
        }
        else{
            int     participantsCnt = command.participants().size();
            String  roomTitle       = command.memberNickInfo().get(command.hostMemberId())+" with "+(participantsCnt-1);
            command.participants().forEach(memberId->{
                participants.add(
                        Participant.create(
                                memberId,
                                command.roomId(),
                                roomTitle,
                                command.roomType()
                        )
                );
            });
        }

        repository.saveParticipants(participants);
    }


    public DomainRoomDto.FindRoomInfo findLogin(DomainRoomDto.FindRoomCommand command){
        return DomainRoomDto.FindRoomInfo.fromDomainList(repository.findRoomByMemberWhenLogin(command.memberId()));
    }


}
