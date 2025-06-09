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
    ALREADY_EXIST_NICK("ALREADY_EXIST_NAME","이미 사용중인 닉네임 입니다."),
    ALREADY_EMAIL_NICK("ALREADY_EMAIL_NICK","이미 사용중인 이메일 입니다."),
    NOT_FOUND_USER("NOT_FOUND_USER","사용자를 찾을 수 없습니다."),
    NOT_EXIST("NOT_EXIST","사용자 정보를 찾을 수 없습니다."),
    BAD_CREDENTIAL("BAD_CREDENTIAL","비밀번호가 일치하지 않습니다."),
    NOT_AUTHENTICATION_MEMBER("NOT_AUTHENTICATION_MEMBER","검증된 사용자가 아닙니다.")
    ;
    private final String code;
    private final String message;
}
