package com.com_chat.user.interfaces.relationship;

import com.com_chat.user.application.relationship.FacadeDto;
import com.com_chat.user.domain.relationship.RelationshipEnum;

public record ApiDto() {
    public record CreateRequest(
            Long toMemberId
    )
    {
        public FacadeDto.CreateCriteria toCriteria(Long fromMemberId,RelationshipEnum.RelationType createType){
            return new FacadeDto.CreateCriteria(fromMemberId,toMemberId, createType);
        }
    }
    public record CreateResponse(Long relationshipId){
        public static CreateResponse fromResult(FacadeDto.CreateResult result){
            return new CreateResponse(result.relationshipId());
        }
    }

    public record UnFollowRequest(
            Long relationshipId
    )
    {
        public FacadeDto.UpdateCriteria toCriteria(RelationshipEnum.Command command, RelationshipEnum.RelationType updateType){
            return new FacadeDto.UpdateCriteria(relationshipId, command, updateType);
        }
    }
}
