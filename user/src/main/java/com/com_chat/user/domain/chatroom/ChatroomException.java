package com.com_chat.user.domain.chatroom;


import com.com_chat.user.support.exceptions.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ChatroomException implements ExceptionInterface {
    PRIVATE_MEMBER_MULTI("PRIVATE MEMBER MULTI","개인 채팅 상대방은 한명이어야 합니다."),
    ALREADY_EXIST_PRIVATE("ALREADY EXIST PRIVATE","이미 개인 채팅방이 존재합니다."),
    MULTI_MEMBER_NOT_EXIST("MULTI MEMBER NOT EXIST","단체 채팅방의 참여 인원이 존재하지 않습니다."),
    PRIVATE_MULTI_EXCEPTION("PRIVATE MULTI EXCEPTION","해당 유저와의 개인 채팅방이 여러개 존재합니다."),
    NOT_EXIST_PARTICIPANT("NOT EXIST PARTICIPANT","이 채팅방과 연관관계가 존재하지 않습니다."),
    NOT_EXIST_ROOM("NOT EXIT ROOM","존재하지 않는 채팅방입니다.")
    ;

    private final String code;
    private final String message;
}
