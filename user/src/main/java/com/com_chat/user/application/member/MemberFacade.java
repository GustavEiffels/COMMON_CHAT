package com.com_chat.user.application.member;

import com.com_chat.user.domain.member.MemberService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class MemberFacade {
    private final MemberService memberService;

    public SignUp.Result signUp(SignUp.Criteria criteria){
        Long memberId = memberService.create(criteria.nick(), criteria.email(), criteria.password(), criteria.profilePath());
        return new SignUp.Result(memberId);
    }
}
