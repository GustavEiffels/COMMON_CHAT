package com.com_chat.user.support.exceptions;


import com.com_chat.user.domain.member.MemberException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.naming.AuthenticationException;

@RestControllerAdvice
public class ExceptionController {

    @ExceptionHandler(value = BaseException.class)
    public ApiResponse<Void> exceptionHandler(BaseException e){
        return ApiResponse.fail(e);
    }

    @ExceptionHandler(value = Exception.class)
    public ApiResponse<Void> exceptionHandler(Exception e){
        System.out.println(e.getLocalizedMessage());
        System.out.println(e.getClass().getName());
        return ApiResponse.fail(BaseExceptionEnum.EXCEPTION_ISSUED);
    }

    @ExceptionHandler(value = InternalAuthenticationServiceException.class)
    public ApiResponse<Void> exceptionHandler(InternalAuthenticationServiceException e){
        return ApiResponse.fail(MemberException.NOT_EXIST);
    }

    @ExceptionHandler(value = BadCredentialsException.class)
    public ApiResponse<Void> exceptionHandler(BadCredentialsException e){
        return ApiResponse.fail(MemberException.BAD_CREDENTIAL);
    }


}
