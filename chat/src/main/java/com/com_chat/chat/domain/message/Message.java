package com.com_chat.chat.domain.message;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record Message(
         String id,
         Long msgRoomCnt,
         String messageContents,
         Long userPid,
         Long roomPid,
         LocalDateTime createDateTime,
         LocalDate createDate
) {
}
