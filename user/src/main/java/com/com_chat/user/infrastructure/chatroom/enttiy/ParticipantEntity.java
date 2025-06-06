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
    private Long participantId;

    private Long memberId;

    private Long chatroomId;

    private String roomTitle;

    private RoomEnum.RoomType type;



    public Participant toDomain(){
        return new Participant(participantId,memberId,chatroomId,roomTitle,type);
    }

    public static ParticipantEntity fromDomain(Participant participant){
        ParticipantEntity entity = new ParticipantEntity();
        entity.participantId = participant.participantId();
        entity.chatroomId    = participant.chatroomId();
        entity.memberId      = participant.memberId();
        entity.type          = participant.type();
        entity.roomTitle     = participant.roomTitle();

        return entity;
    }
}
