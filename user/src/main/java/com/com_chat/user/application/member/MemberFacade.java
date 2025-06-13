package com.com_chat.user.application.member;

import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.RoomService;
import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberService;
import com.com_chat.user.domain.relationship.DomainRelationsDto;
import com.com_chat.user.domain.relationship.RelationshipService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class MemberFacade {
    private final MemberService memberService;
    private final RoomService roomService;
    private final RelationshipService relationshipService;

    @Transactional
    public FacadeMemberDto.SignUpResult signUp(FacadeMemberDto.SignUpCriteria criteria){
        return FacadeMemberDto.SignUpResult.fromInfo(memberService.create(criteria.toCommand()));
    }

    public FacadeMemberDto.SearchResult search(FacadeMemberDto.SearchCriteria criteria){
        return FacadeMemberDto.SearchResult.fromInfo(memberService.search(criteria.toCommand()));
    }

    @Transactional
    public void update(FacadeMemberDto.UpdateCriteria criteria){
        memberService.update(criteria.toCommand());
    }

    @Transactional
    public FacadeMemberDto.LoginResult login(FacadeMemberDto.LoginCriteria criteria) {
        DomainMemberDto.LoginInfo memberLoginInfo = memberService.login(criteria.toCommand());

        Long findMemberId = memberLoginInfo.memberId();

        DomainRoomDto.FindRoomInfo roomInfo = roomService.findLogin(
                new DomainRoomDto.FindRoomCommand(findMemberId)
        );

        // private Room
        List<FacadeMemberDto.RoomInfo> privateRoom = roomInfo.privateRooms().stream()
                .map(info->new FacadeMemberDto.RoomInfo(info.roomId(),info.roomTitle(), info.type())).toList();

        // private Multi
        List<FacadeMemberDto.RoomInfo> multiRoom   = roomInfo.multiRooms().stream()
                .map(info->new FacadeMemberDto.RoomInfo(info.roomId(), info.roomTitle(),info.type())).toList();


        DomainRelationsDto.FindInfo relationInfo = relationshipService.loginFind(findMemberId);


        // follow list
        List<FacadeMemberDto.RelationShip> followList = relationInfo.followList().stream()
                .map(follow -> new FacadeMemberDto.RelationShip(follow.relationshipId(), follow.toMemberId(),follow.type()))
                .toList();

        // block list
        List<FacadeMemberDto.RelationShip> blockList = relationInfo.blockList().stream()
                .map(block -> new FacadeMemberDto.RelationShip(block.relationshipId(), block.toMemberId(),block.type()))
                .toList();

        List<Long> memberIds = Stream.concat(
                        followList.stream().map(FacadeMemberDto.RelationShip::memberId),
                        blockList.stream().map(FacadeMemberDto.RelationShip::memberId)
                )
                .distinct()
                .toList();

        List<FacadeMemberDto.MemberInfo> memberInfoList = memberService.findMemberInfo(memberIds).memberDtoList()
                .stream()
                .map(FacadeMemberDto.MemberInfo::fromDomain)
                .toList();


        return new FacadeMemberDto.LoginResult(
                memberLoginInfo.memberId(),
                memberLoginInfo.accessToken(),
                memberLoginInfo.refreshToken(),
                memberLoginInfo.nick(),
                privateRoom,
                multiRoom,
                followList,
                blockList,
                memberInfoList);
    }


    public FacadeMemberDto.SearchUserInfoInfo searchUserInfo(FacadeMemberDto.SearchUserInfoCriteria criteria){
        DomainMemberDto.MemberNickDto userInfo =  memberService.findMemberInfo(criteria.memberId());
        return new FacadeMemberDto.SearchUserInfoInfo(
                new FacadeMemberDto.MemberInfo(userInfo.memberId(),userInfo.nick())
        );
    }

}
