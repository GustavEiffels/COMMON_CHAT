package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

class DomainUnitTest {

    @Test
    @DisplayName("""
            Member Domain 생성 할 때 닉네임 정규식에 맞지 않으면,
            BaseException 이 발생한다.
            """)
    void nick_valid_exception() {
        // given & when
        Exception emergeException = Assertions.assertThrows(BaseException.class, () -> {
            new Member(
                    null,
                    "테",
                    "email@test.com",
                    "Qwer!@34#",
                    "example/path",
                    LocalDateTime.now());
        });

        // then
        Assertions.assertEquals(emergeException.getMessage(),"닉네임의 규칙에 맞지 않습니다. 영문 대소문자 한글 숫자 및 특수문자 _ 만 사용 가능합니다.");
    }

    @Test
    @DisplayName("""
            Member Domain 생성 할 때 이메일이 정규식에 맞지 않으면,
            BaseException 이 발생한다.
            """)
    void email_valid_exception() {
        // given & when
        Exception emergeException = Assertions.assertThrows(BaseException.class, () -> {
            new Member(
                    null,
                    "테니스",
                    "ema",
                    "Qwer!@34#",
                    "example/path",
                    LocalDateTime.now());
        });

        // then
        Assertions.assertEquals(emergeException.getMessage(),MemberException.INVALID_EMAIL.getMessage());
    }


    @Test
    @DisplayName("""
            Member Domain 생성 할 때 비밀번호가 정규식에 맞지 않으면,
            BaseException 이 발생한다.
            """)
    void password_valid_exception() {
        // given & when
        Exception emergeException = Assertions.assertThrows(BaseException.class, () -> {
            new Member(
                    null,
                    "테니스",
                    "email@naver.com",
                    "123",
                    "example/path",
                    LocalDateTime.now());
        });

        // then
        Assertions.assertEquals(emergeException.getMessage(),MemberException.INVALID_PASSWORD.getMessage());
    }
}