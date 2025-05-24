package com.com_chat.user.application.relationship;

import com.com_chat.user.domain.relationship.DomainDto;
import com.com_chat.user.domain.relationship.RelationshipEnum;

public record FacadeDto() {

    public record CreateCriteria(
            Long fromMemberId,
            Long toMemberId,
            RelationshipEnum.RelationType createType

    )
    {
        public DomainDto.CreateCommand toCommand(){
            return new DomainDto.CreateCommand(
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
        public static CreateResult fromInfo( DomainDto.CreateInfo createInfo){
            return new CreateResult(createInfo.relationshipId());
        }
    }


    public record UpdateCriteria(
            Long relationshipId,
            RelationshipEnum.Command command,
            RelationshipEnum.RelationType update


    )
    {
        public DomainDto.UpdateCommand toCommand(){
            return new DomainDto.UpdateCommand(
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
        public static UpdateResult fromInfo( DomainDto.UpdateInfo updateInfo ){
            return new UpdateResult(updateInfo.relationshipId());
        }
    }


}
