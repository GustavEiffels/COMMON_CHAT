package com.com_chat.user.infrastructure.chatroom.enttiy;


import com.com_chat.user.domain.chatroom.Participant;
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
public class ParticipantEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long participateId;

    private Long memberId;

    private Long chatroomId;

    private RoomEnum.RoomType type;



    public Participant toDomain(){
        return new Participant(participateId,memberId,chatroomId,type);
    }

    public static ParticipantEntity fromDomain(Participant participant){
        ParticipantEntity entity = new ParticipantEntity();
        entity.participateId = participant.participateId();
        entity.chatroomId    = participant.chatroomId();
        entity.memberId      = participant.memberId();
        entity.type          = participant.type();

        return entity;
    }
}
