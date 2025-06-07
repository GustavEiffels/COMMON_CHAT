package com.com_chat.user.domain.chatroom;

import com.com_chat.user.support.exceptions.BaseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record DomainRoomDto() {

    public record CreateCommand(
            Long ownerId,

            List<Long> memberIds,

            RoomEnum.RoomType type
    )
    {
        public CreateCommand{


            if( type.equals(RoomEnum.RoomType.PRIVATE) && memberIds.size() != 2 ){
                throw new BaseException(ChatroomException.PRIVATE_MEMBER_MULTI);
            }

            if( type.equals(RoomEnum.RoomType.MULTI) && memberIds.isEmpty() ){
                throw new BaseException(ChatroomException.MULTI_MEMBER_NOT_EXIST);
            }
        }

        public Room toDomain(){
            return new Room(null,type,ownerId);
        }
    }
    public record CreateInfo(
            Long roomId,
            RoomEnum.RoomType type
    )
    {
        public static CreateInfo fromDomain(Room room){
            return new CreateInfo(
                    room.roomId(),
                    room.type()
            );
        }
    }
    public record CreateRelationCommand(
            Long roomId,
            Long hostMemberId,
            List<Long> participants,
            Map<Long, String> memberNickInfo,
            RoomEnum.RoomType roomType
    )
    {}
    public record ExitCommand(
            Long ownerId,
            Long roomId,
            Long nextOwnerId
    )
    {
    }
    public record ExitInfo(
            Long roomId,
            RoomEnum.RoomType type
    )
    {
        public static ExitInfo fromDomain(Participant participant){
            return new ExitInfo(participant.chatroomId(), participant.type());
        }
    }
    public record FindRoomCommand(
            Long memberId
    )
    {}
    public record FindRoomInfo(
        List<FindRoomDto> privateRooms,
        List<FindRoomDto> multiRooms
    )
    {
        public static FindRoomInfo fromDomainList(List<DomainRoomDto.FindRoomDto> roomList) {
            Map<Boolean, List<FindRoomDto>> partitioned = roomList.stream()
                    .map(room -> new FindRoomDto(room.type(), room.roomTitle(), room.roomId()))
                    .collect(Collectors.partitioningBy(dto -> dto.type == RoomEnum.RoomType.PRIVATE));

            return new FindRoomInfo(
                    partitioned.get(true),   // PRIVATE
                    partitioned.get(false)   // MULTI
            );
        }
    }
    public record FindRoomDto(
            RoomEnum.RoomType type,
            String roomTitle,
            Long roomId
    )
    {}
}
