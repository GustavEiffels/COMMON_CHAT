package com.com_chat.user.domain.member;

import java.util.Optional;

public interface MemberRepository {
    Optional<Member> findByNick(String nick);

    Long create(Member member);
}
