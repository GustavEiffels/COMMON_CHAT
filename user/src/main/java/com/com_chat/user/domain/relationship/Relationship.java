package com.com_chat.user.domain.relationship;

public record Relationship(
        Long relationshipId,
        Long fromMemberId,
        Long toMemberId,
        RelationshipEnum.RelationType type
)
{
    public Relationship updateRelationType(RelationshipEnum.RelationType type){
        return new Relationship(relationshipId,fromMemberId,toMemberId,type);
    }
}
