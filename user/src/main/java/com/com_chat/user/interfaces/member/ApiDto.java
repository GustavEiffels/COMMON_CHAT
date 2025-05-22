package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.FacadeDto;
import com.com_chat.user.domain.member.MemberEnum;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public record ApiDto() {
// SIGN UP
    public record SignUpRequest(
            String nick,
            String email,
            String password,
            String profilePath
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

    // FIND

    public record SearchRequest(
            MemberEnum.QueryType type,
            String query,
            Pageable pageable
    )
    {
        public SearchRequest(
                String type,
                String query,
                Pageable pageable
        )
        {
            this(MemberEnum.QueryType.valueOf(type.toUpperCase()),query,pageable);
        }

        public FacadeDto.SearchCriteria toCriteria(){
            return new FacadeDto.SearchCriteria(type,query,pageable);
        }
    }

    public record SearchResponse(
            List<SearchApiDto> members,
            int totalPages,
            long totalElements,
            int currentPage,
            boolean hasNext,
            boolean hasPrevious
    )
    {
        public static SearchResponse fromResult(
                FacadeDto.SearchResult result
        )
        {
            return new SearchResponse(
                result.members().stream()
                        .map(SearchApiDto::fromFacade)
                        .toList(),
                    result.totalPages(),
                    result.totalElements(),
                    result.currentPage(),
                    result.hasNext(),
                    result.hasNext()
            );
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

    // UPDATE
    public record UpdateRequest(
            Long memberId,
            String password,
            String profilePath
    )
    {
        public FacadeDto.UpdateCriteria toCriteria(){
            return new FacadeDto.UpdateCriteria(memberId,password,profilePath);
        }
    }



}
