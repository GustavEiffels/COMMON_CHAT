package com.com_chat.user.application.member;

import com.com_chat.user.domain.member.DomainDto;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.interfaces.member.ApiDto;

import java.time.LocalDateTime;
import java.util.List;

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


// SEARCH
    public record SearchCriteria(
            MemberEnum.QueryType queryType,
            String query
    )
    {

    }
    public record SearchResult(
            List<SearchFacadeDto> members
    )
    {

    }

    public record SearchFacadeDto(
            Long memberId,
            String nick,
            String email,
            String profilePath
    )
    {}
}
