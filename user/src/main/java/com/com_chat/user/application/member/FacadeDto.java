package com.com_chat.user.application.member;

import com.com_chat.user.domain.member.DomainDto;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.interfaces.member.ApiDto;
import org.springframework.data.domain.Pageable;

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
            String query,
            Pageable pageable

    )
    {
        public DomainDto.SearchCommand toCommand(){
            return new DomainDto.SearchCommand(
                    queryType,
                    query,
                    pageable
            );
        }
    }


    public record SearchResult(
            List<SearchFacadeDto> members,
            int totalPages,
            long totalElements,
            int currentPage,
            boolean hasNext,
            boolean hasPrevious
    )
    {
        public static SearchResult fromInfo(
                DomainDto.SearchInfo info
        ){
            return new SearchResult(
                    info.members().stream()
                            .map(SearchFacadeDto::fromDomain)
                            .toList(),
                    info.totalPages(),
                    info.totalElements(),
                    info.currentPage(),
                    info.hasNext(),
                    info.hasPrevious()
            );
        }
    }

    public record SearchFacadeDto(
            Long memberId,
            String nick,
            String email,
            String profilePath
    )
    {
        public static SearchFacadeDto fromDomain(
                DomainDto.SearchDomainDto domainDto
        )
        {
            return new SearchFacadeDto(
                    domainDto.memberId(),
                    domainDto.nick(),
                    domainDto.email(),
                    domainDto.profilePath()
            );
        }
    }


// UPDATE
    public record UpdateCriteria(
            Long memberId,
            String password,
            String profilePath
    )
    {
        public DomainDto.UpdateCommand toCommand(){
            return new DomainDto.UpdateCommand(memberId,password,profilePath);
        }
    }
}
