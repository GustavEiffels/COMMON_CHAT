package com.com_chat.user.domain.chatroom;

public record Participant(
        Long participantId,
        Long memberId,
        Long chatroomId,
        String roomTitle,
        RoomEnum.RoomType type
) {
    public static Participant create(
            Long memberId,
            Long chatroomId,
            String roomTitle,
            RoomEnum.RoomType type
    ){
        return new Participant(
                null,
                memberId,
                chatroomId,
                roomTitle,
                type
        );
    }
}
