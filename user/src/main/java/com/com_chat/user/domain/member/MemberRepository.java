package com.com_chat.user.domain.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface MemberRepository {

    Page<Member> findByQuery(MemberEnum.QueryType type, String query, Pageable pageable);

    Optional<Member> findByNick(String nick);

    Optional<Member> findByEmail(String email);

    Optional<Member> find(Long memberId);

    Long save(Member member);
}
