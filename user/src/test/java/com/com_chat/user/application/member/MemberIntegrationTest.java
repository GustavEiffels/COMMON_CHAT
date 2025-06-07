package com.com_chat.user.application.member;


import com.com_chat.user.domain.member.Member;
import com.com_chat.user.domain.member.MemberRepository;
import com.com_chat.user.fixture.MemberFixture;
import com.com_chat.user.fixture.RelationshipFixture;
import com.com_chat.user.fixture.RoomFixture;
import com.com_chat.user.infrastructure.chatroom.RoomJpaRepository;
import com.com_chat.user.infrastructure.member.MemberJpaRepository;
import com.com_chat.user.infrastructure.relationship.RelationshipJpaRepository;
import com.com_chat.user.support.exceptions.BaseException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrowsExactly;


@ActiveProfiles("test")
@SpringBootTest
class MemberIntegrationTest {

    @Autowired
    MemberFacade memberFacade;

    @Autowired
    MemberRepository memberRepository;

    @Autowired
    MemberFixture memberFixture;

    @Autowired
    RoomFixture roomFixture;

    @Autowired
    RelationshipFixture relationshipFixture;

    @Autowired
    MemberJpaRepository memberJpaRepository;
    @Autowired
    RelationshipJpaRepository relationshipJpaRepository;
    @Autowired
    RoomJpaRepository roomJpaRepository;


    @BeforeEach
    void cleanUp() {
        memberJpaRepository.deleteAll();
        relationshipJpaRepository.deleteAll();
        roomJpaRepository.deleteAll();

    }



    @Test
    @DisplayName("""
            멤버 Facade 로 멤버를 생성하면 
            MemberId 를 반환한다.  
            """)
    void signUp_success(){
        // given
        String nick = "TestNick";
        String email = "email@email.com";
        String password = "Qwer!@34!";
        String profilePath = "test/path";
        FacadeMemberDto.SignUpCriteria criteria = new FacadeMemberDto.SignUpCriteria(
          nick,
          email,
          password,
          profilePath
        );

        // when
        FacadeMemberDto.SignUpResult result  = memberFacade.signUp(criteria);

        Long resultId = result.memberId();
        Member findMember = memberRepository.find(resultId).get();
        Assertions.assertEquals(nick,findMember.nick());
        Assertions.assertEquals(email,findMember.email());
        Assertions.assertEquals(profilePath,findMember.profilePath());
    }

    @Test
    @DisplayName("""
            멤버 Facade 로 멤버를 생성하려고 할때,
            이미 존재하는 닉네임일 경우 
            예외를 발생한다.
            """)
    void already_used_name(){
        // given
        memberFixture.createTest1();

        String nick = "TestNick";
        String email = "email@email.com";
        String password = "Qwer!@34!";
        String profilePath = "test/path";
        FacadeMemberDto.SignUpCriteria criteria = new FacadeMemberDto.SignUpCriteria(
                nick,
                email,
                password,
                profilePath
        );

        // when & then
        assertThrowsExactly(
                BaseException.class,
                () -> memberFacade.signUp(criteria),
                "이미 사용 중인 닉네임입니다."
        );



    }

    @Test
    @DisplayName("""
            아이디 페스워드를 입력하면
            로그인을 할 수 있고, 채팅방 정보와 관계들을 반환한다.
            """)

    void loginSuccessTest(){
        // given
        // 1. Member 생성하기
        List<Member> members = new ArrayList<>();
        for(int i = 1; i<=10; i++){
            members.add(
                    memberFixture.create(
                            "test"+i,
                            "test"+i+"@naver.com",
                            "Qwer!234!")
            );
        }
        Member member = members.get(0);

        // 2. private room 생성
        for(int i = 1; i<=9; i++){
            roomFixture.privateRoom(member.memberId(),members.get(i).memberId());
        }

        // 3. multi room 생성
        List<Long> memberIds = new ArrayList<>();
        for(int i = 4; i<=9; i++){
            memberIds.add(members.get(i).memberId());
        }
        roomFixture.multiRoom(member.memberId(),memberIds);

        // 4. favorite
        for(int i = 1; i<=5; i++){
            relationshipFixture.favorite(member.memberId(),members.get(i).memberId());
        }

        // 5. block
        for(int i = 6; i<=9; i++){
            relationshipFixture.block(member.memberId(),members.get(i).memberId());
        }

        // when
        FacadeMemberDto.LoginCriteria criteria = new FacadeMemberDto.LoginCriteria(
                member.email(),
                "Qwer!234!"
        );

        // then
        FacadeMemberDto.LoginResult result = memberFacade.login(criteria);
        System.out.println("result : "+result);
        Assertions.assertEquals(1,result.multiRoom().size(),"테스트 케이스의 멀티 룸 개수는 1개이다.");
        Assertions.assertEquals(9,result.privateRoom().size(),"테스트 케이스의 개인 채팅 룸 개수는 9 개이다.");
        Assertions.assertEquals(5,result.followList().size(),"테스트 케이스의 즐겨찾기에 추가한 사용자 수는 5명이다.");
        Assertions.assertEquals(4,result.blockList().size(),"테스트 케이스의 차단목록에 추가한 사용자 수는 4명이다.");

    }
}