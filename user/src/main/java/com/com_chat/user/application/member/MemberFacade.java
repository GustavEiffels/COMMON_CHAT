package com.com_chat.user.application.member;

import com.com_chat.user.domain.chatroom.DomainRoomDto;
import com.com_chat.user.domain.chatroom.RoomService;
import com.com_chat.user.domain.member.DomainMemberDto;
import com.com_chat.user.domain.member.MemberService;
import com.com_chat.user.domain.relationship.DomainRelationsDto;
import com.com_chat.user.domain.relationship.RelationshipService;
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

    public FacadeDto.SignUpResult signUp(FacadeDto.SignUpCriteria criteria){
        return FacadeDto.SignUpResult.fromInfo(memberService.create(criteria.toCommand()));
    }

    public FacadeDto.SearchResult search(FacadeDto.SearchCriteria criteria){
        return FacadeDto.SearchResult.fromInfo(memberService.search(criteria.toCommand()));
    }

    public void update(FacadeDto.UpdateCriteria criteria){
        memberService.update(criteria.toCommand());
    }

    public FacadeDto.LoginResult login(FacadeDto.LoginCriteria criteria){
        DomainMemberDto.LoginInfo memberLoginInfo = memberService.login(criteria.toCommand());

        Long findMemberId = memberLoginInfo.memberId();

        DomainRoomDto.FindRoomInfo roomInfo = roomService.find(
                new DomainRoomDto.FindRoomCommand(findMemberId)
        );

        // private Room
        List<FacadeDto.LoginRoom> privateRoom = roomInfo.privateRooms().stream()
                .map(info->new FacadeDto.LoginRoom(info.roomId(), info.type())).toList();

        // private Multi
        List<FacadeDto.LoginRoom> multiRoom   = roomInfo.multiRooms().stream()
                .map(info->new FacadeDto.LoginRoom(info.roomId(), info.type())).toList();


        DomainRelationsDto.FindInfo relationInfo = relationshipService.loginFind(findMemberId);


        // follow list
        List<FacadeDto.LoginRelationship> followList = relationInfo.followList().stream()
                .map(follow -> new FacadeDto.LoginRelationship(follow.relationshipId(), follow.toMemberId(),follow.type()))
                .toList();

        // block list
        List<FacadeDto.LoginRelationship> blockList = relationInfo.followList().stream()
                .map(block -> new FacadeDto.LoginRelationship(block.relationshipId(), block.toMemberId(),block.type()))
                .toList();


        List<Long> memberIds = Stream.concat(
                        relationInfo.followList().stream().map(DomainRelationsDto.FindDto::relationshipId),
                        relationInfo.blockList().stream().map(DomainRelationsDto.FindDto::relationshipId)
                )
                .distinct()
                .toList();

        List<FacadeDto.LoginMemberInfo> memberInfoList = memberService.findMemberInfo(memberIds).memberDtoList()
                .stream()
                .map(FacadeDto.LoginMemberInfo::fromDomain)
                .toList();


        return new FacadeDto.LoginResult(
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

}
