package com.com_chat.user.domain.member;

import java.util.Optional;

public interface MemberRepository {
    Optional<Member> findByNick(String nick);

    Optional<Member> findByEmail(String email);

    Long create(Member member);
}
