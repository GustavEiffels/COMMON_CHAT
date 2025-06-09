package com.com_chat.user.interfaces.member;

import com.com_chat.user.application.member.FacadeMemberDto;
import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.RoomEnum;
import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberEnum;
import com.com_chat.user.domain.relationship.RelationshipEnum;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

public record ApiMemberDto() {
// SIGN UP
    public record SignUpRequest(
            String nick,
            String email,
            String password,
            String profilePath
    )
    {
        public FacadeMemberDto.SignUpCriteria toCriteria() {
            return new FacadeMemberDto.SignUpCriteria(
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
                FacadeMemberDto.SignUpResult result
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

        public FacadeMemberDto.SearchCriteria toCriteria(){
            return new FacadeMemberDto.SearchCriteria(type,query,pageable);
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
                FacadeMemberDto.SearchResult result
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
                FacadeMemberDto.SearchFacadeDto dto
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
        public FacadeMemberDto.UpdateCriteria toCriteria(){
            return new FacadeMemberDto.UpdateCriteria(memberId,password,profilePath);
        }
    }

    // LOGIN
    public record LoginRequest(
            String email,
            String password
    )
    {
        public FacadeMemberDto.LoginCriteria toCriteria(){
            return new FacadeMemberDto.LoginCriteria(
                    email,
                    password
            );
        }
    }

    public record LoginResponse(
            Long memberId,
            String accessToken,
            String refreshToken,
            String nick,
            List<RoomInfo> privateRoom,
            List<RoomInfo> multiRoom,
            List<RelationShip> followList,
            List<RelationShip> blockList,
            List<MemberInfo> memberInfoList
    )
    {
        public static ApiMemberDto.LoginResponse fromResult(FacadeMemberDto.LoginResult result){
            return new LoginResponse(
                    result.memberId(),
                    result.accessToken(),
                    result.refreshToken(),
                    result.nick(),
                    ApiMemberDto.RoomInfo.fromResult(result.privateRoom()),
                    ApiMemberDto.RoomInfo.fromResult(result.multiRoom()),
                    ApiMemberDto.RelationShip.fromResult(result.followList()),
                    ApiMemberDto.RelationShip.fromResult(result.blockList()),
                    ApiMemberDto.MemberInfo.fromResult(result.memberInfoList())
            );
        }
    }

    public record RoomInfo(
        Long roomId,
        String roomTitle,
        RoomEnum.RoomType roomType
    )
    {
        public static List<ApiMemberDto.RoomInfo> fromResult(List<FacadeMemberDto.RoomInfo> results){

            return results.stream()
                    .map(result->new ApiMemberDto.RoomInfo(result.roomId(),result.roomTitle(),result.roomType()))
                    .toList();
        }
    }

    public record RelationShip(
        Long relationshipId,
        Long memberId,
        RelationshipEnum.RelationType relationType
    )
    {
        public static List<ApiMemberDto.RelationShip> fromResult(List<FacadeMemberDto.RelationShip> results){
            return results.stream()
                    .map(result->new ApiMemberDto.RelationShip(
                            result.relationshipId(),
                            result.memberId(),
                            result.type())
                    ).toList();
        }
    }

    public record MemberInfo(
        Long memberId,
        String nick
    )
    {
        public static List<ApiMemberDto.MemberInfo> fromResult(List<FacadeMemberDto.MemberInfo> results){
            return results.stream()
                    .map(result->new ApiMemberDto.MemberInfo(
                            result.memberId(),
                            result.nick())
                    ).toList();
        }
    }

}
