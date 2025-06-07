package com.com_chat.user.infrastructure.member;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class  MemberRepositoryImpl implements MemberRepository {

    private final MemberJpaRepository jpaRepository;

    @Override
    public List<Member> findMembers(List<Long> memberIds) {
        return jpaRepository.findMembers(memberIds);
    }

    @Override
    public Page<Member> findByQuery(MemberEnum.QueryType type, String query, Pageable pageable) {
        return jpaRepository.findByQuery(type,query,pageable);
    }

    @Override
    public Optional<Member> findByNick(String nick) {
        return jpaRepository.findByNick(nick);
    }

    @Override
    public Optional<Member> findByEmail(String email) {
        return jpaRepository.findByEmail(email);
    }

    @Override
    public Optional<Member> find(Long memberId) {
        return jpaRepository.findById(memberId).map(MemberEntity::toDomain);
    }

    @Override
    public Long save(Member member) {
        return jpaRepository.save(MemberEntity.fromDomain(member)).getMemberId();
    }

}
