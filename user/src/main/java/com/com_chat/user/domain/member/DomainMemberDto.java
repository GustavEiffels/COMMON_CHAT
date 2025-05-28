package com.com_chat.user.domain.member;

import com.com_chat.user.support.exceptions.BaseException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.regex.Pattern;

import static org.springframework.util.StringUtils.*;

public record DomainMemberDto() {
    private static final Pattern NICKNAME_REGEX = Pattern.compile("^[a-zA-Z가-힣0-9_]{2,16}$");
    private static final Pattern EMAIL_REGEX    = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern PASSWORD_REGEX = Pattern.compile( "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");


    // SIGNUP
    public record SignUpCommand(
            String nick,
            String email,
            String password,
            String profilePath
    )
    {

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
                    null,
                    null
            );
        }
    }

    public record SignUpInfo(
            Long memberId
    )
    {
        public static SignUpInfo fromDomain(Long memberId) {
            return new SignUpInfo(memberId);
        }
    }

// Search
    public record SearchCommand(
            MemberEnum.QueryType type,
            String query,
            Pageable pageable
    )
    {
        public SearchCommand{
            if(type.equals(MemberEnum.QueryType.EMAIL) && !EMAIL_REGEX.matcher(query).matches() ){
                throw new BaseException(MemberException.INVALID_EMAIL);
            }
            if(type.equals(MemberEnum.QueryType.NICK) && !NICKNAME_REGEX.matcher(query).matches() ){
                throw new BaseException(MemberException.INVALID_NICKNAME);
            }
        }
    }


    public record SearchInfo(
            List<SearchDomainDto> members,
            int totalPages,
            long totalElements,
            int currentPage,
            boolean hasNext,
            boolean hasPrevious
    )
    {
        public static SearchInfo fromDomain(
            Page<Member> page
        )
        {
            return new SearchInfo(
                    page.getContent().stream()
                            .map(SearchDomainDto::fromDomain)
                            .toList(),
                    page.getTotalPages(),
                    page.getTotalElements(),
                    page.getNumber() + 1, // Convert to 1-based for client
                    page.hasNext(),
                    page.hasPrevious()
            );
        }
    }

    public record SearchDomainDto(
            Long memberId,
            String nick,
            String email,
            String profilePath
    )
    {
        public static SearchDomainDto fromDomain(
                Member member
        )
        {
            return new SearchDomainDto(
                    member.memberId(),
                    member.nick(),
                    member.email(),
                    member.profilePath()
            );
        }
    }

// UPDATE
    public record UpdateCommand(
            Long memberId,
            String password,
            String profilePath
    )
    {
        public UpdateCommand{
            if(hasText(password) && !PASSWORD_REGEX.matcher(password).matches() ){
                throw new BaseException(MemberException.INVALID_PASSWORD);
            }
        }
    }


// LOGIN
    public record LoginCommand(
        String email,
        String password
    )
    {
        public LoginCommand{
            if( !PASSWORD_REGEX.matcher(password).matches() ){
                throw new BaseException(MemberException.INVALID_PASSWORD);
            }
            if( !EMAIL_REGEX.matcher(email).matches() ){
                throw new BaseException(MemberException.INVALID_EMAIL);
            }
        }
    }

    public record LoginInfo(
            Long memberId,
            String accessToken,
            String refreshToken,
            String nick
    )
    {}

    public record LoginMemberInfo(
            List<LoginMemberDto> memberDtoList
    ){}

    public record LoginMemberDto(
            Long memberId,
            String nick
    ){

    }



}
