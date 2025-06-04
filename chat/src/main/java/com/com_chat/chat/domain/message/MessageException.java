package com.com_chat.chat.domain.message;

import com.com_chat.chat.support.ExceptionInterface;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageException implements ExceptionInterface {


    MESSAGE_JSON_CONVERT("MESSAGE_JSON_CONVERT","JSON 변환 시 예외가 발생하였습니다.")
    ;

    private final String code;
    private final String message;
}
