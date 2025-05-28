package com.com_chat.user.infrastructure.chatroom;


import com.com_chat.user.domain.chatroom.Participant;
import com.com_chat.user.infrastructure.chatroom.enttiy.ParticipantEntity;
import com.com_chat.user.infrastructure.chatroom.enttiy.QParticipantEntity;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import static com.com_chat.user.infrastructure.chatroom.enttiy.QParticipantEntity.participantEntity;


@Repository
@RequiredArgsConstructor
public class ParticipantRepositoryCustomImpl implements ParticipantRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Participant> findParticipant(Long memberId, Long roomId) {


        Optional<ParticipantEntity> optionalParticipant = Optional.ofNullable(queryFactory.selectFrom(participantEntity)
                .where(
                        eqMemberId(memberId),
                        eqRoomId(roomId),
                        participantEntity.isDelete.isFalse()
                ).fetchOne());

         return optionalParticipant.map(ParticipantEntity::toDomain);
    }


    BooleanExpression eqMemberId(Long memberId){
        return memberId != null ? participantEntity.memberId.eq(memberId):null;
    }

    BooleanExpression eqRoomId(Long roomId){
        return roomId != null ? participantEntity.chatroomId.eq(roomId):null;
    }
}
