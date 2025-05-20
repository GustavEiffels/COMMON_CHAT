package com.com_chat.user.application.member;

import com.com_chat.user.domain.member.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberFacade {
    private final MemberService memberService;

    public FacadeDto.SignUpResult signUp(FacadeDto.SignUpCriteria criteria){
        return FacadeDto.SignUpResult.fromInfo(memberService.create(criteria.toCommand()));
    }

    public FacadeDto.SearchResult search(FacadeDto.SearchCriteria criteria){
        return FacadeDto.SearchResult.fromInfo(memberService.search(criteria.toCommand()));
    }
}
