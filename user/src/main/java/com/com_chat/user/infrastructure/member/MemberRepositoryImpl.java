package com.com_chat.user.infrastructure.member;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepository {

    private final MemberJpaRepository jpaRepository;

    @Override
    public Optional<Member> findByNick(String nick) {
        return jpaRepository.findByNick(nick);
    }

    @Override
    public Long create(Member member) {
        return jpaRepository.save(MemberEntity.fromDomain(member)).getMemberId();
    }


}
