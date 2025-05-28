package com.com_chat.user.domain.relationship;


import java.util.List;
import java.util.Optional;

public interface RelationshipRepository {

    List<Relationship> find(Long fromMemberId, Long toMemberId, RelationshipEnum.RelationType type);

    List<Relationship> findByLogin(Long fromMemberId);

    Optional<Relationship> findOne(Long fromMemberId, Long toMemberId);

    Relationship save(Relationship relationship);

    Optional<Relationship> findId(Long relationshipId);
}
