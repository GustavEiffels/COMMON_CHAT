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

}
