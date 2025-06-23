package com.com_chat.user.support.jwt;

import com.com_chat.user.support.exceptions.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum JwtException implements ExceptionInterface {
    JWT_EXCEPTION("JWT_EXCEPTION","토큰 에러가 발생하였습니다."),
    JWT_EXPIRE_EXCEPTION("JWT_EXPIRE_EXCEPTION","JWT 토큰이 만료 되었습니다."),
    JWT_SIGNATURE_EXCEPTION("JWT_EXPIRE_SIGNATURE_EXCEPTION","여기서 발행한 토큰이 아닙니다"),
    JWT_INVALID_EXCEPTION("JWT_INVALID_EXCEPTION","유효한 토큰이 아닙니다."),
    ;

    private final String code;
    private final String message;
}
