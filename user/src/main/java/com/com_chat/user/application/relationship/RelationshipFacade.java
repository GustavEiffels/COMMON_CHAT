package com.com_chat.user.application.relationship;


import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberService;
import com.com_chat.user.domain.relationship.DomainRelationsDto;
import com.com_chat.user.domain.relationship.RelationshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RelationshipFacade {

    private final MemberService memberService;
    private final RelationshipService relationshipService;

    public FacadeRelationshipDto.CreateResult create(FacadeRelationshipDto.CreateCriteria criteria){
        // Login User Id
        Long fromMemberId = memberService.findAuthenticationMember().memberId();

        // Target User Nick Info
        DomainMemberDto.MemberNickDto memberNickDto = memberService.findMemberInfo(criteria.toMemberId());

        // Create Relationship
        DomainRelationsDto.CreateInfo relationShipInfo = relationshipService.create(criteria.toCommand(fromMemberId));

        return FacadeRelationshipDto.CreateResult.fromInfo(
                FacadeRelationshipDto.RelationShipDto.fromCreateInfo(relationShipInfo),
                FacadeRelationshipDto.MemberInfoDto.fromMemberNickDto(memberNickDto)
        );
    }

    public FacadeRelationshipDto.UpdateResult update(FacadeRelationshipDto.UpdateCriteria criteria){
        return FacadeRelationshipDto.UpdateResult.fromInfo( relationshipService.update(criteria.toCommand()));
    }
}
