package com.com_chat.user.application.member;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MemberIntegrationTest {

    @Autowired
    MemberFacade memberFacade;

    @Test
    @DisplayName("""
            멤버 Facade 로 멤버를 생성하면 
            MemberId 를 반환한다.  
            """)
    void signUp_success(){
        // given
        FacadeDto.SignUpCriteria criteria = new FacadeDto.SignUpCriteria(
          "TestNick",
          "email@email.com",
          "Qwer!@34!",
          "test/path"
        );

        // when & then
        FacadeDto.SignUpResult result  = memberFacade.signUp(criteria);
    }
}