package com.com_chat.user.infrastructure.relationship;

import com.com_chat.user.infrastructure.relationship.entity.RelationshipEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelationshipJpaRepository extends JpaRepository<RelationshipEntity,Long>,RelationshipRepositoryCustom {

}
