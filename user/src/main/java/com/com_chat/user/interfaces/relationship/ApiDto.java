package com.com_chat.user.interfaces.relationship;

import com.com_chat.user.application.relationship.FacadeRelationshipDto;
import com.com_chat.user.domain.relationship.RelationshipEnum;

public record ApiDto() {

// CREATE REQUEST
    public record CreateRequest(
            Long toMemberId
    )
    {
        public FacadeRelationshipDto.CreateCriteria toCriteria(RelationshipEnum.RelationType createType){
            return new FacadeRelationshipDto.CreateCriteria(toMemberId, createType);
        }
    }
    public record CreateResponse(
            RelationShipDto relationShipDto,
            MemberInfoDto memberInfoDto

    )
    {
        public static CreateResponse fromResult(FacadeRelationshipDto.CreateResult result){
            return new CreateResponse(
                    RelationShipDto.fromResult(result.relationShipDto()),
                    MemberInfoDto.fromResult(result.memberInfoDto())
            );
        }
    }

    public record RelationShipDto(
            Long relationshipId,
            Long memberId,
            RelationshipEnum.RelationType type
    )
    {
        public static RelationShipDto fromResult(FacadeRelationshipDto.RelationShipDto relationShipDto){
            return new RelationShipDto(
                    relationShipDto.relationshipId(),
                    relationShipDto.memberId(),
                    relationShipDto.type()
            );
        }
    }

    public record MemberInfoDto(
            Long memberId,
            String nick
    )
    {
        public static MemberInfoDto fromResult(FacadeRelationshipDto.MemberInfoDto memberInfoDto){
            return new MemberInfoDto(
                    memberInfoDto.memberId(),
                    memberInfoDto.nick()
            );
        }
    }

    public record UpdateRequest(
            Long relationshipId
    )
    {
        public FacadeRelationshipDto.UpdateCriteria toCriteria(RelationshipEnum.Command command, RelationshipEnum.RelationType updateType){
            return new FacadeRelationshipDto.UpdateCriteria(relationshipId, command, updateType);
        }
    }
}
