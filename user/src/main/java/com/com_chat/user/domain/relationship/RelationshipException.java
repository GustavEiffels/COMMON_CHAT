package com.com_chat.user.domain.relationship;

import com.com_chat.user.support.exceptions.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RelationshipException implements ExceptionInterface {

    ALREADY_FAVORITE("ALREADY_FAVORITE","이미 즐겨찾기에 추가된 멤버입니다."),
    ALREADY_BLOCK("ALREADY_BLOCK","이미 차단된 멤버입니다."),
    ALREADY_NONE("ALREADY_NONE","이미 아무 사이 아닙니다."),
    NOT_EXIST("NOT_EXIST","존재하지 않는 관계 입니다.")
    ;

    private final String code;
    private final String message;
}
