package com.com_chat.user.infrastructure.relationship;

import com.com_chat.user.domain.relationship.Relationship;
import com.com_chat.user.domain.relationship.RelationshipEnum;

import java.util.List;
import java.util.Optional;

public interface RelationshipRepositoryCustom {

    List<Relationship> find(Long fromMemberId, Long toMemberId, RelationshipEnum.RelationType type);

    Optional<Relationship> findOne(Long fromMemberId, Long toMemberId);

    List<Relationship> findByMemberId(Long fromMemberId);

}
