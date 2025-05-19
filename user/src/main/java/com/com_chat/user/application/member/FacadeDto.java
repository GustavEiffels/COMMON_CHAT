package com.com_chat.user.application.member;

import com.com_chat.user.domain.member.DomainDto;
import java.time.LocalDateTime;

public record FacadeDto() {
    public record SignUpCriteria(
            String nick,
            String email,
            String password,
            String profilePath
    ){
        public DomainDto.SignUpCommand toCommand(){
            return new DomainDto.SignUpCommand(
                    nick,
                    email,
                    password,
                    profilePath
            );
        }
    }

    public record SignUpResult(
            Long memberId
    ){
        public static SignUpResult fromInfo(DomainDto.SignUpInfo info){
            return new SignUpResult(info.memberId());
        }
    }
}
