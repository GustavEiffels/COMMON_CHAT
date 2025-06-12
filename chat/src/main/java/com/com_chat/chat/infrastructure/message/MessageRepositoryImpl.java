package com.com_chat.chat.infrastructure.message;

import com.com_chat.chat.domain.message.Message;
import com.com_chat.chat.domain.message.MessageRepository;
import com.com_chat.chat.infrastructure.message.entity.MessageEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MessageRepositoryImpl implements MessageRepository {

    private final MongoTemplate template;
    private final MessageMongoRepository mongoRepository;

    @Override
    public Optional<Message> findLastMessage(Long roomId) {

        Query query = new Query(Criteria.where("roomPid").is(roomId))
                .with(Sort.by(Sort.Direction.DESC, "createDateTime"))
                .limit(1);
        Optional<MessageEntity> message= Optional.ofNullable(template.findOne(query, MessageEntity.class));
        return message.map(MessageEntity::toDomain);

    }

    @Override
    public Message save(Message message) {
        return mongoRepository.save(MessageEntity.fromDomain(message)).toDomain();
    }

    @Override
    public Page<Message> findMessages(Long roomId, Pageable pageable) {

        Query query = new Query(Criteria.where("roomPid").is(roomId))
                .with(Sort.by(Sort.Direction.DESC, "createDateTime"));

        long total = template.count(query, MessageEntity.class);

        List<MessageEntity> messageEntities = template.find(query.with(pageable), MessageEntity.class);

        List<Message> messages = messageEntities.stream()
                .map(MessageEntity::toDomain)
                .toList();

        return new PageImpl<>(messages, pageable, total);

    }
}
