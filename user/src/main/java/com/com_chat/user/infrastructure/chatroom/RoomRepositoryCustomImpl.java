package com.com_chat.user.infrastructure.chatroom;


import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.Room;
import com.com_chat.user.domain.chatroom.RoomEnum;
import com.com_chat.user.infrastructure.chatroom.enttiy.RoomEntity;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

import static com.com_chat.user.infrastructure.chatroom.enttiy.QParticipantEntity.participantEntity;
import static com.com_chat.user.infrastructure.chatroom.enttiy.QRoomEntity.roomEntity;

@Repository
@RequiredArgsConstructor
public class RoomRepositoryCustomImpl implements RoomRepositoryCustom{

    private final JPAQueryFactory queryFactory;

    @Override
    public List<Room> findRoom(Long loginMemberId, Long otherMemberId, RoomEnum.RoomType type) {
        return queryFactory
                .select(roomEntity).from(participantEntity)
                .join(roomEntity)
                .on(participantEntity.chatroomId.eq(roomEntity.roomId))
                .where(
                        participantEntity.memberId.in(loginMemberId, otherMemberId),
                        participantEntity.type.eq(type),
                        roomEntity.type.eq(type)
                )
                .groupBy(participantEntity.chatroomId, roomEntity.roomId, roomEntity.type, roomEntity.ownerId)
                .having(participantEntity.memberId.countDistinct().eq(2L))
                .fetch()
                .stream().map(RoomEntity::toDomain)
                .toList();

    }

    @Override
    public List<Room> findRoomByMemberId(Long loginMemberId) {
        return queryFactory.select(roomEntity)
                .from(participantEntity)
                .join(roomEntity)
                .on(participantEntity.chatroomId.eq(roomEntity.roomId))
                .where(
                        participantEntity.memberId.eq(loginMemberId),
                        participantEntity.isDelete.isFalse(),
                        roomEntity.isDelete.isFalse()
                )
                .fetch()
                .stream().map(RoomEntity::toDomain)
                .toList();
    }

    @Override
    public List<DomainRoomDto.FindRoomDto> findRoomByMemberWhenLogin(Long memberId) {
        return queryFactory.select(
                        Projections.constructor(
                                DomainRoomDto.FindRoomDto.class,
                                roomEntity.type,
                                participantEntity.roomTitle,
                                roomEntity.roomId

                        )
                )
                .from(participantEntity)
                .join(roomEntity)
                .on(participantEntity.chatroomId.eq(roomEntity.roomId))
                .where(
                        participantEntity.memberId.eq(memberId),
                        participantEntity.isDelete.isFalse(),
                        roomEntity.isDelete.isFalse()
                )
                .fetch();
    }

}
