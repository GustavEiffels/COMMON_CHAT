package com.com_chat.chat.interfaces.Invitation;

import com.com_chat.chat.domain.Invitation.Invitation;

public record InvitationApiDto() {

    public record InviteRequest(
            Long roomPid,
            Long fromMemberId,
            Long toMemberId
    ){
        public Invitation toDomain(){
            return new Invitation(roomPid,fromMemberId,toMemberId);
        }
    }
}
