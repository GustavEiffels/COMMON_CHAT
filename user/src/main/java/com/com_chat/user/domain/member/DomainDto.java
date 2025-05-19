package com.com_chat.user.domain.member;

import java.time.LocalDateTime;

public record DomainDto() {

    public record SignUpCommand(
            String nick,
            String email,
            String password,
            String profilePath
    ) {
        public Member toDomain() {
            return new Member(
                    null,
                    nick,
                    email,
                    password,
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
