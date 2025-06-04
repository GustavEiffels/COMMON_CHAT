package com.com_chat.chat.infrastructure.message;

import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.infrastructure.message.entity.MessageEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.Optional;

@RequiredArgsConstructor
public class MessageNoRepositoryCustomImpl implements MessageNoRepositoryCustom {
    private final MongoTemplate template;

    @Override
    public Optional<Message> findLatestByRoomPid(Long roomPid) {
        Query query = new Query(Criteria.where("roomPid").is(roomPid))
                .with(Sort.by(Sort.Direction.DESC, "createDate"))
                .limit(1);

        return Optional.ofNullable(template.findOne(query, MessageEntity.class))
                .map(MessageEntity::toDomain);
    }
}
