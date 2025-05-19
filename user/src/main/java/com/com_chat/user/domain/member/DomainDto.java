package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import java.util.regex.Pattern;

public record DomainDto() {

    public record SignUpCommand(
            String nick,
            String email,
            String password,
            String profilePath
    ) {

        // REGEX
        private static final Pattern NICKNAME_REGEX = Pattern.compile("^[a-zA-Z가-힣0-9_]{2,16}$");
        private static final Pattern EMAIL_REGEX    = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
        private static final Pattern PASSWORD_REGEX = Pattern.compile( "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");

        public SignUpCommand{
            if( !PASSWORD_REGEX.matcher(password).matches() ){
                throw new BaseException(MemberException.INVALID_PASSWORD);
            }
            if( !NICKNAME_REGEX.matcher(nick).matches() ){
                throw new BaseException(MemberException.INVALID_NICKNAME);
            }
            if( !EMAIL_REGEX.matcher(email).matches() ){
                throw new BaseException(MemberException.INVALID_EMAIL);
            }
        }
        public Member toDomain(String encodedPassword) {
            return new Member(
                    null,
                    nick,
                    email,
                    encodedPassword,
                    profilePath,
                    null
            );
        }
    }

    public record SignUpInfo(
            Long memberId
    ) {
        public static SignUpInfo fromDomain(Long memberId) {
            return new SignUpInfo(memberId);
        }
    }
}
