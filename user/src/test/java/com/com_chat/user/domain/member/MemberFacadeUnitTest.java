package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class MemberFacadeUnitTest {

    @Test
    @DisplayName("사용자 생성 시, 필수 값을 안넣은 경우 에러 발생")
    void necessary_is_empty(){
        // given
        String nick     = "";
        String email    = "";
        String password = "";

        // when
        BaseException baseException = assertThrows(BaseException.class,()->Member.create(nick,email,password,null));

        // then
        assertEquals(MemberException.NOT_ENOUGH_NECESSARY.getCode(),baseException.getCode());
    }

    @Test
    @DisplayName("사용자 생성 시 닉네임 정규식에 맞지 않는 경우 예외 발생")
    void invalidNick(){
        // given
        String nick     = "2";
        String email    = "test@naver.com";
        String password = "Qwer!@34!34";

        // when
        BaseException baseException = assertThrows(BaseException.class,()->Member.create(nick,email,password,null));

        // then
        assertEquals(MemberException.INVALID_NICKNAME.getCode(),baseException.getCode());
    }

    @Test
    @DisplayName("사용자 생성 시 이메일이 정규식에 맞지 않는 경우 예외 발생")
    void invalidEmail(){
        // given
        String nick     = "test2";
        String email    = "test32321";
        String password = "Qwer!@34!34";

        // when
        BaseException baseException = assertThrows(BaseException.class,()->Member.create(nick,email,password,null));

        // then
        assertEquals(MemberException.INVALID_EMAIL.getCode(),baseException.getCode());
    }

    @Test
    @DisplayName("사용자 생성 시 비밀번호가 정규식에 맞지 않는 경우 예외 발생")
    void invalidPw(){
        // given
        String nick     = "test2";
        String email    = "test@naver.com";
        String password = "Qwer11111111";

        // when
        BaseException baseException = assertThrows(BaseException.class,()->Member.create(nick,email,password,null));

        // then
        assertEquals(MemberException.INVALID_PASSWORD.getCode(),baseException.getCode());
    }
}