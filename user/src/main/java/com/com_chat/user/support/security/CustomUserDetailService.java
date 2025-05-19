package com.com_chat.user.support.security;

import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final MemberRepository memberRepository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        MemberEntity member = MemberEntity.fromDomain(memberRepository.findByEmail(username)
                .orElseThrow(()->new UsernameNotFoundException("사용자를 찾을 수 없습니다. "+username)));
        return new CustomUserDetails(member);
    }
}
