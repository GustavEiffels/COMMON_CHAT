package com.com_chat.user.application.member;

import com.com_chat.user.domain.chatroom.RoomEnum;
import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import org.springframework.data.domain.Pageable;

import java.util.List;

public record FacadeDto() {

 // SIGN UP
    public record SignUpCriteria(
            String nick,
            String email,
            String password,
            String profilePath
    ){
        public DomainMemberDto.SignUpCommand toCommand(){
            return new DomainMemberDto.SignUpCommand(
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
        public static SignUpResult fromInfo(DomainMemberDto.SignUpInfo info){
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
        public DomainMemberDto.SearchCommand toCommand(){
            return new DomainMemberDto.SearchCommand(
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
                DomainMemberDto.SearchInfo info
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
                DomainMemberDto.SearchDomainDto domainDto
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
        public DomainMemberDto.UpdateCommand toCommand(){
            return new DomainMemberDto.UpdateCommand(memberId,password,profilePath);
        }
    }

// LOGIN
    public record LoginCriteria(
        String email,
        String password
    )
    {
        public DomainMemberDto.LoginCommand toCommand(){
            return new DomainMemberDto.LoginCommand(email,password);
        }
    }

    public record LoginResult(
            Long memberId,
            String accessToken,
            String refreshToken,
            String nick,
            List<LoginRoom> privateRoom,
            List<LoginRoom> multiRoom,
            List<LoginRelationship> followList,
            List<LoginRelationship> blockList,
            List<MemberNickInfo> memberInfoList
    )
    {}

    public record LoginRoom(
        Long roomId,
        String roomTitle,
        RoomEnum.RoomType roomType
    )
    {}

    public record LoginRelationship(
        Long relationshipId,
        Long memberId,
        RelationshipEnum.RelationType type
    )
    {}

    public record MemberNickInfo(
            Long memberId,
            String nick
    )
    {
        public static MemberNickInfo fromDomain(DomainMemberDto.MemberNickDto domainDto ){
            return new MemberNickInfo(
                    domainDto.memberId(),
                    domainDto.nick()
            );
        }
    }
}
