package com.com_chat.user.support.jwt;

import com.com_chat.user.support.exceptions.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum JwtException implements ExceptionInterface {
    JWT_EXCEPTION("JWT_EXCEPTION","토큰 에러가 발생하였습니다.")
    ;

    private final String code;
    private final String message;
}
