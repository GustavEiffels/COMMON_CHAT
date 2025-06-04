package com.com_chat.chat.infrastructure.message;

import com.com_chat.chat.domain.message.Message;

import java.util.Optional;

public interface MessageNoRepositoryCustom {

    Optional<Message> findLatestByRoomPid(Long roomPid);
}
