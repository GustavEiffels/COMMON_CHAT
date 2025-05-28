package com.com_chat.user.infrastructure.relationship;

import com.com_chat.user.domain.relationship.Relationship;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import com.com_chat.user.infrastructure.relationship.entity.RelationshipEntity;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

import static com.com_chat.user.infrastructure.relationship.entity.QRelationshipEntity.relationshipEntity;

@Repository
@RequiredArgsConstructor
public class RelationshipRepositoryCustomImpl implements RelationshipRepositoryCustom{
    private final JPAQueryFactory queryFactory;

    @Override
    public List<Relationship> find(Long fromMemberId, Long toMemberId, RelationshipEnum.RelationType type) {
        return queryFactory.selectFrom(relationshipEntity)
                .where(
                        eqFromMemberId(fromMemberId),
                        eqToMemberId(toMemberId),
                        eqRelationshipType(type),
                        relationshipEntity.isDelete.isFalse()
                )
                .fetch()
                .stream()
                .map(RelationshipEntity::toDomain)
                .toList();
    }

    @Override
    public Optional<Relationship> findOne(Long fromMemberId, Long toMemberId) {

        return Optional.ofNullable(queryFactory.selectFrom(relationshipEntity)
                .where(
                        eqFromMemberId(fromMemberId),
                        eqToMemberId(toMemberId)
                )
                .fetchOne()).map(RelationshipEntity::toDomain);
    }

    @Override
    public List<Relationship> findByMemberId(Long fromMemberId) {
        return queryFactory.selectFrom(relationshipEntity)
                .where(
                        eqFromMemberId(fromMemberId),
                        relationshipEntity.type.ne(RelationshipEnum.RelationType.NONE)
                )
                .fetch().stream().map(RelationshipEntity::toDomain)
                .toList();
    }


    private BooleanExpression eqFromMemberId(Long fromMemberId){
        return fromMemberId != null ? relationshipEntity.fromMemberId.eq(fromMemberId) : null;
    }
    private BooleanExpression eqToMemberId(Long toMemberId){
        return toMemberId != null ? relationshipEntity.toMemberId.eq(toMemberId) : null;
    }
    private BooleanExpression eqRelationshipType(RelationshipEnum.RelationType type){
        return type != null ? relationshipEntity.type.eq(type) : null;
    }
}
