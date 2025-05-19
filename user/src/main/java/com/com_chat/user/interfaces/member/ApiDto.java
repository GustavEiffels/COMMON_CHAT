package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.FacadeDto;

import java.time.LocalDateTime;

public record ApiDto() {

    public record SignUpRequest(
            String nick,
            String email,
            String password,
            String profilePath,
            LocalDateTime localDateTime
    ){
        public FacadeDto.SignUpCriteria toCriteria(){
            return new FacadeDto.SignUpCriteria(
                    nick,
                    email,
                    password,
                    profilePath
            );
        }
    }
    public record SignUpResponse(
            Long memberId
    ){
        public static SignUpResponse fromResult(
                FacadeDto.SignUpResult result
        ){
            return new SignUpResponse(result.memberId());
        }
    }


}
