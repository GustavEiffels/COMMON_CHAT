package com.com_chat.user.support.exceptions;


import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionController {

    @ExceptionHandler(value = BaseException.class)
    public ApiResponse<Void> exceptionHandler(BaseException e){
        return ApiResponse.fail(e);
    }
}
