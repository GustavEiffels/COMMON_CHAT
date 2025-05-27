package com.com_chat.user.domain.chatroom;

import com.com_chat.user.support.exceptions.BaseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {
    private final RoomRepository repository;

    public DomainDto.CreateInfo create(DomainDto.CreateCommand command){
        if (command.type().equals(RoomEnum.RoomType.PRIVATE)) {
            Long otherId = command.memberIds().get(0);
            List<Room> roomList = repository.findRoom(command.ownerId(), otherId, RoomEnum.RoomType.PRIVATE);

            if (!roomList.isEmpty()) {
                if (roomList.size() == 1) {
                    return DomainDto.CreateInfo.fromDomain(roomList.get(0));
                }
                throw new BaseException(ChatroomException.PRIVATE_MULTI_EXCEPTION);
            }
        }

        Room room = repository.saveRoom(command.toDomain());

        repository.saveParticipants(command.toDomain(room.roomId()));

        return DomainDto.CreateInfo.fromDomain(room);
    }


}
