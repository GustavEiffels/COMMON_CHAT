package com.com_chat.user.application.relationship;

import com.com_chat.user.domain.relationship.DomainRelationsDto;
import com.com_chat.user.domain.relationship.RelationshipEnum;

public record FacadeDto() {

    public record CreateCriteria(
            Long fromMemberId,
            Long toMemberId,
            RelationshipEnum.RelationType createType

    )
    {
        public DomainRelationsDto.CreateCommand toCommand(){
            return new DomainRelationsDto.CreateCommand(
                    fromMemberId,
                    toMemberId,
                    createType
            );
        }
    }

    public record CreateResult(
            Long relationshipId
    )
    {
        public static CreateResult fromInfo( DomainRelationsDto.CreateInfo createInfo){
            return new CreateResult(createInfo.relationshipId());
        }
    }


    public record UpdateCriteria(
            Long relationshipId,
            RelationshipEnum.Command command,
            RelationshipEnum.RelationType update


    )
    {
        public DomainRelationsDto.UpdateCommand toCommand(){
            return new DomainRelationsDto.UpdateCommand(
                    relationshipId,
                    command,
                    update
            );
        }
    }

    public record UpdateResult(
            Long relationshipId
    )
    {
        public static UpdateResult fromInfo( DomainRelationsDto.UpdateInfo updateInfo ){
            return new UpdateResult(updateInfo.relationshipId());
        }
    }


}
