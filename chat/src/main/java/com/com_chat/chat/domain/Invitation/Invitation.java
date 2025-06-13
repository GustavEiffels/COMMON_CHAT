package com.com_chat.chat.domain.Invitation;

public record Invitation(
        Long roomPid,
        Long fromMemberId,
        Long toMemberId
) {
}
