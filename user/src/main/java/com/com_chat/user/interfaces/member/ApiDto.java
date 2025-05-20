package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.FacadeDto;
import com.com_chat.user.domain.member.MemberEnum;

import java.time.LocalDateTime;
import java.util.List;

public record ApiDto() {
// SIGN UP

    public record SignUpRequest(
            String nick,
            String email,
            String password,
            String profilePath,
            LocalDateTime localDateTime
    )
    {
        public FacadeDto.SignUpCriteria toCriteria() {
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
    )
    {
        public static SignUpResponse fromResult(
                FacadeDto.SignUpResult result
        )
        {
            return new SignUpResponse(result.memberId());
        }
    }


    // FIND OUT
    public record SearchRequest(
            MemberEnum.QueryType type,
            String query
    )
    {
        public SearchRequest(
                String type,
                String query
        )
        {
            this(MemberEnum.QueryType.valueOf(type.toUpperCase()),query);
        }

        public FacadeDto.SearchCriteria toCriteria(){
            return new FacadeDto.SearchCriteria(type,query);
        }
    }

    public record SearchResponse(
            List<SearchApiDto> members
    )
    {
        public static SearchResponse fromResult(
                FacadeDto.SearchResult result
        )
        {
            return new SearchResponse(
                    result.members().stream()
                            .map(SearchApiDto::fromFacade)
                            .toList());
        }
    }

    public record SearchApiDto(
            Long memberId,
            String nick,
            String email,
            String profilePath
    )
    {
        public static SearchApiDto fromFacade(
                FacadeDto.SearchFacadeDto dto
        )
        {
            return new SearchApiDto(
                    dto.memberId(),
                    dto.nick(),
                    dto.email(),
                    dto.profilePath()
            );
        }
    }


}
