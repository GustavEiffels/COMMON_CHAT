package com.com_chat.user.support.security;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final MemberRepository memberRepository;
    @Override
    public UserDetails loadUserByUsername(String username){

        Optional<Member> findMember = memberRepository.findByEmail(username);
        if(findMember.isEmpty()){
            throw new BadCredentialsException("Invalid email or password");
        }

        return new CustomUserDetails(MemberEntity.fromDomain(findMember.get()));
    }
}
