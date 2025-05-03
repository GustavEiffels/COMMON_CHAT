package com.com_chat.user.support.exceptions;


import lombok.Getter;

@Getter
public class BaseException extends RuntimeException{
    private final String code;
    private final String message;

    public BaseException(ExceptionInterface exceptionInterface){
        super(exceptionInterface.getMessage());
        this.code = exceptionInterface.getCode();
        this.message = exceptionInterface.getMessage();
    }
}
