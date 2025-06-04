package com.com_chat.user.application.relationship;


import com.com_chat.user.domain.member.MemberService;
import com.com_chat.user.domain.relationship.RelationshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RelationshipFacade {

    private final MemberService memberService;
    private final RelationshipService relationshipService;

    public FacadeDto.CreateResult create(FacadeDto.CreateCriteria criteria){
        Long fromMemberId = memberService.findAuthenticationMember().memberId();
        memberService.existMember(fromMemberId);
        return FacadeDto.CreateResult.fromInfo(relationshipService.create(criteria.toCommand(fromMemberId)));
    }

    public FacadeDto.UpdateResult update(FacadeDto.UpdateCriteria criteria){
        return FacadeDto.UpdateResult.fromInfo( relationshipService.update(criteria.toCommand()));
    }
}
