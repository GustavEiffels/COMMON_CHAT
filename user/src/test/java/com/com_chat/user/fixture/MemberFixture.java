package com.com_chat.user.fixture;

import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.domain.member.MemberService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
@Component
@RequiredArgsConstructor
public class MemberFixture {

    private final MemberRepository memberRepository;
    private final MemberService memberService;


    @Transactional
    public Member createTest1(){
        String nick = "TestNick";
        String email = "email@email.com";
        String password = "Qwer!@34!";
        String profilePath = "test/path";
        DomainMemberDto.SignUpCommand command = new DomainMemberDto.SignUpCommand(
                nick,
                email,
                password,
                profilePath
        );


        Long memberId = memberService.create(command).memberId();
        return memberRepository.find(memberId).orElseThrow();
    }


    @Transactional
    public Member create(String nick, String email, String password){
        DomainMemberDto.SignUpCommand command = new DomainMemberDto.SignUpCommand(
                nick,
                email,
                password,
                "test/path"
        );


        Long memberId = memberService.create(command).memberId();
        return memberRepository.find(memberId).orElseThrow();
    }
}
