package com.com_chat.user.infrastructure.chatroom.enttiy;


import com.com_chat.user.domain.chatroom.Room;
import com.com_chat.user.domain.chatroom.RoomEnum;
import com.com_chat.user.support.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long   roomId;

    private RoomEnum.RoomType type;

    private Long ownerId;


    public Room toDomain(){
        return new Room(roomId,type,ownerId);
    }

    public static RoomEntity fromDomain(Room room){
        RoomEntity entity = new RoomEntity();
        entity.ownerId = room.ownerId();
        entity.roomId = room.roomId();
        entity.type   = room.type();
        return entity;
    }
}
