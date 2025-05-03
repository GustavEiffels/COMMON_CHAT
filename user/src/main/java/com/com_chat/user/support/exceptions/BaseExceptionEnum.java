package com.com_chat.user.support.exceptions;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BaseExceptionEnum implements ExceptionInterface
{
    EXCEPTION_ISSUED("BASE.EXCEPTION.EXCEPTION_ISSUED", "시스템에러 발생"),
    EXCEPTION_VALIDATION("BASE.EXCEPTION.EXCEPTION_VALIDATION", "요청 값 검증 실패"),
    ;

    private final String code;
    private final String message;

    @Override
    public String getCode() {
        return this.code;
    }

    @Override
    public String getMessage() {
        return this.message;
    }
}
