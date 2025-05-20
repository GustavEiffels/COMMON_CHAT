package com.com_chat.user.infrastructure.member;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberJpaRepository extends JpaRepository<MemberEntity,Long> ,MemberRepositoryCustom{
    Optional<Member> findByNick(String nick);

    Optional<Member> findByEmail(String email);


}
