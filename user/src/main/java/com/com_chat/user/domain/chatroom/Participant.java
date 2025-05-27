package com.com_chat.user.domain.chatroom;

public record Participant(
        Long participateId,
        Long memberId,
        Long chatroomId,

        RoomEnum.RoomType type
) {
}
