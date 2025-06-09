package com.com_chat.user.application.relationship;

import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.relationship.DomainRelationsDto;
import com.com_chat.user.domain.relationship.RelationshipEnum;

public record FacadeRelationshipDto() {

    public record CreateCriteria(
            Long toMemberId,
            RelationshipEnum.RelationType createType

    )
    {
        public DomainRelationsDto.CreateCommand toCommand(Long fromMemberId){
            return new DomainRelationsDto.CreateCommand(
                    fromMemberId,
                    toMemberId,
                    createType
            );
        }
    }

    public record CreateResult(
            RelationShipDto relationShipDto,
            MemberInfoDto memberInfoDto
    )
    {
        public static CreateResult fromInfo(RelationShipDto relationShipDto, MemberInfoDto memberInfoDto){
            return new CreateResult(relationShipDto,memberInfoDto);
        }
    }

    public record RelationShipDto(
            Long relationshipId,
            Long memberId,
            RelationshipEnum.RelationType type
    )
    {
        public static RelationShipDto fromCreateInfo(DomainRelationsDto.CreateInfo createInfo){
            return new RelationShipDto(createInfo.relationshipId(),createInfo.memberId(),createInfo.type());
        }
    }

    public record MemberInfoDto(
            Long memberId,
            String nick
    )
    {
        public static MemberInfoDto fromMemberNickDto(DomainMemberDto.MemberNickDto memberNickDto){
            return new MemberInfoDto(memberNickDto.memberId(), memberNickDto.nick());
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
