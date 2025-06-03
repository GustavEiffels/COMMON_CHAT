package com.com_chat.user.domain.relationship;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record DomainRelationsDto() {

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
            return new CreateInfo(relationship.relationshipId());
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

    public record FindInfo(
            List<FindDto> followList,
            List<FindDto> blockList

    ){
        public static FindInfo fromDomainList(List<Relationship> relationshipList){
            Map<Boolean,List<FindDto>> findTypeMap = relationshipList.stream()
                    .map(relation -> new FindDto(
                            relation.relationshipId(),
                            relation.toMemberId(),
                            relation.type()))
                    .collect(Collectors.partitioningBy(findDto -> findDto.type == RelationshipEnum.RelationType.FAVORITE) );

            return new FindInfo(
                    findTypeMap.get(true),
                    findTypeMap.get(false)
            );
        }
    }


    public record FindDto(
            Long relationshipId,
            Long toMemberId,
            RelationshipEnum.RelationType type
    )
    {
        public static FindDto fromDomain(Relationship relationship){
            return new FindDto(
                    relationship.relationshipId(),
                    relationship.toMemberId(),
                    relationship.type()
            );
        }
    }
}
