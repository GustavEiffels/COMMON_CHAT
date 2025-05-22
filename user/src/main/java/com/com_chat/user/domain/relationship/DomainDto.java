package com.com_chat.user.domain.relationship;

public record DomainDto() {

    public record CreateCommand(
            Long fromMemberId,
            Long toMemberId,
            RelationshipEnum.RelationType createType
    )
    {
        public Relationship toDomain()
        {
            return new Relationship(
                    null,
                    fromMemberId,
                    toMemberId,
                    createType
                    );
        }
    }

    public record CreateInfo(
            Long relationshipId
    )
    {
        public static CreateInfo fromDomain(Relationship relationship){
            return new CreateInfo(relationship.toMemberId());
        }
    }

    public record UpdateCommand(
            Long relationshipId,
            RelationshipEnum.Command command,
            RelationshipEnum.RelationType toUpdateType
    )
    {}

    public record UpdateInfo(
            Long relationshipId
    )
    {
        public static UpdateInfo fromDomain(Relationship relationship){
            return new UpdateInfo(relationship.relationshipId());
        }
    }

}
