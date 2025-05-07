package com.com_chat.user.domain.member;


import com.com_chat.user.support.exceptions.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MemberException implements ExceptionInterface {

    NOT_ENOUGH_NECESSARY("NOT_ENOUGH_NECESSARY","필수 값이 들어가지 않았습니다."),
    INVALID_NICKNAME("INVALID_NICKNAME_REG","닉네임의 규칙에 맞지 않습니다. 영문 대소문자 한글 숫자 및 특수문자 _ 만 사용 가능합니다."),
    INVALID_EMAIL("INVALID_EMAIL","유효한 이메일 형식이 아닙니다."),
    INVALID_PASSWORD("INVALID_PASSWORD","대소문자, 숫자, 특수문자를 하나씩 포함해야 합니다."),
    ALREADY_EXIST_NICK("ALREADY_EXIST_NAME","이미 사용중인 닉네임 입니다.")
    ;
    private final String code;
    private final String message;
}
