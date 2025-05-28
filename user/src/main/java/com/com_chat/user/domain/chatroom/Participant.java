package com.com_chat.user.domain.chatroom;

public record Participant(
        Long participantId,
        Long memberId,
        Long chatroomId,

        RoomEnum.RoomType type
) {
}
