package com.com_chat.user.infrastructure.member;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberEnum;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;


public interface MemberRepositoryCustom {
    Page<Member> findByQuery(MemberEnum.QueryType type, String query, Pageable pageable);

    List<Member> findMembers(List<Long> memberIds);
}
