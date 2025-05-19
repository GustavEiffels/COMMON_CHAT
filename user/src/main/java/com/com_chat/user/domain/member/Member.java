package com.com_chat.user.domain.member;


import com.com_chat.user.support.exceptions.BaseException;
import java.time.LocalDateTime;
import java.util.regex.Pattern;


public record Member(
        Long   memberId,
        String nick,
        String email,
        String password,
        String profilePath,
        LocalDateTime lastLoginDate
){

    // REGEX
    private static final Pattern NICKNAME_REGEX = Pattern.compile("^[a-zA-Z가-힣0-9_]{2,16}$");
    private static final Pattern EMAIL_REGEX    = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PASSWORD_REGEX = Pattern.compile( "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");


    // VALUE VALID
    public Member{
        if( !NICKNAME_REGEX.matcher(nick).matches() ){
            throw new BaseException(MemberException.INVALID_NICKNAME);
        }
        if( !EMAIL_REGEX.matcher(email).matches() ){
            throw new BaseException(MemberException.INVALID_EMAIL);
        }
        if( !PASSWORD_REGEX.matcher(password).matches() ){
            throw new BaseException(MemberException.INVALID_PASSWORD);
        }
    }

}
