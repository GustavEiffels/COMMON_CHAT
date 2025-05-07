package com.com_chat.user.application.member;

public record SignUp() {

    public record Criteria(
            String nick,
            String email,
            String password,
            String profilePath
    ){}


    public record Result(
            Long id
    ){}
}
