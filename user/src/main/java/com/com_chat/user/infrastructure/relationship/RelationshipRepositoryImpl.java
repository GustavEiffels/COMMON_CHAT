package com.com_chat.user.infrastructure.relationship;

import com.com_chat.user.domain.relationship.Relationship;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import com.com_chat.user.domain.relationship.RelationshipRepository;
import com.com_chat.user.infrastructure.relationship.entity.RelationshipEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Repository
public class RelationshipRepositoryImpl implements RelationshipRepository {

    private final RelationshipJpaRepository jpaRepository;

    @Override
    public List<Relationship> find(
            Long fromMemberId,
            Long toMemberId,
            RelationshipEnum.RelationType type
    ) {
        return jpaRepository.find(fromMemberId,toMemberId,type);
    }


    @Override
    public Relationship save(Relationship relationship) {
        return jpaRepository.save(RelationshipEntity.fromDomain(relationship).entityRestore()).toDomain();
    }

    @Override
    public Optional<Relationship> findId(Long relationshipId) {
        return jpaRepository.findById(relationshipId)
                .map(RelationshipEntity::toDomain);
    }

    @Override
    public Optional<Relationship> findOne(
            Long fromMemberId,
            Long toMemberId
    ) {
        return jpaRepository.findOne(fromMemberId,toMemberId);
    }
}
