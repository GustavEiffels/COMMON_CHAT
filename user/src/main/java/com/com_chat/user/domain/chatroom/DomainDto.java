package com.com_chat.user.domain.chatroom;

import com.com_chat.user.support.exceptions.BaseException;

import java.util.List;

public record DomainDto() {

    public record CreateCommand(
            Long ownerId,

            List<Long> memberIds,

            RoomEnum.RoomType type
    )
    {
        public CreateCommand{
            if( type.equals(RoomEnum.RoomType.PRIVATE) && memberIds().size() != 1 ){
                throw new BaseException(ChatroomException.PRIVATE_MEMBER_MULTI);
            }

            if( type.equals(RoomEnum.RoomType.MULTI) && memberIds().isEmpty() ){
                throw new BaseException(ChatroomException.MULTI_MEMBER_NOT_EXIST);
            }
        }

        public Room toDomain(){
            return new Room(null,type,ownerId);
        }
        public List<Participant> toDomain(Long chatroomId){
            return memberIds.stream()
                    .map(memberId -> new Participant(null,memberId,chatroomId,type))
                    .toList();
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
}
