package com.com_chat.user.infrastructure.member;

import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.infrastructure.member.entity.MemberEntity;
import com.com_chat.user.infrastructure.member.entity.QMemberEntity;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

import static com.com_chat.user.infrastructure.member.entity.QMemberEntity.memberEntity;
import static org.springframework.util.StringUtils.hasText;

@Repository
@RequiredArgsConstructor
public class MemberRepositoryCustomImpl implements MemberRepositoryCustom{

    private final JPAQueryFactory queryFactory;


    @Override
    public Page<Member> findByQuery(MemberEnum.QueryType type, String query,Pageable pageable) {

        List<Member> results = queryFactory.select(memberEntity)
                .from(memberEntity)
                .where(type.equals(MemberEnum.QueryType.EMAIL) ? likeEmail(query) : likeNick(query))
                .offset(pageable.getOffset())
                .limit(Math.min(pageable.getPageSize(), 10)) // Limit to 10 results max
                .fetch()
                .stream()
                .map(MemberEntity::toDomain)
                .toList();

        Long total = queryFactory.select(memberEntity.memberId.count())
                .from(memberEntity)
                .where(type.equals(MemberEnum.QueryType.EMAIL) ? likeEmail(query) : likeNick(query))
                .fetchOne();

        return new PageImpl<>(results, pageable, total != null ? total : 0L);
    }

    private BooleanExpression likeEmail(String query){
        return hasText(query) ? memberEntity.email.containsIgnoreCase(query) : null;
    }

    private BooleanExpression likeNick(String query){
        return hasText(query) ? memberEntity.nick.containsIgnoreCase(query) : null;
    }
}
