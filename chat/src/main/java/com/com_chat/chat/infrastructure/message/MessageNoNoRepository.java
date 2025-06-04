package com.com_chat.chat.infrastructure.message;

import com.com_chat.chat.infrastructure.message.entity.MessageEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageNoNoRepository extends MongoRepository<MessageEntity,Long>, MessageNoRepositoryCustom {
}
