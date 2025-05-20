package com.com_chat.user.domain.member;


import java.time.LocalDateTime;


public record Member(
        Long   memberId,
        String nick,
        String email,
        String password,
        String profilePath,
        LocalDateTime lastLoginDate
){

    public Member changePassword(String password){
        return new Member(memberId,nick,email,password,profilePath,lastLoginDate);
    }
    public Member changeProfilePath(String profilePath){
        return new Member(memberId,nick,email,password,profilePath,lastLoginDate);
    }
}
