package com.com_chat.chat.support.redis;

import com.com_chat.chat.infrastructure.redis.RedisPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@RequiredArgsConstructor
@Configuration
public class RedisConfig {

    private final RedisProperties redisProperties;

    @Bean
    public ChannelTopic chattingChannel(){
        return new ChannelTopic("chat");
    }

    @Bean
    public ChannelTopic inviteChannelTopic(){
        return new ChannelTopic("invite");
    }

    @Bean
    public RedisTemplate<String,String> redisTemplate(RedisConnectionFactory connectionFactory){
        RedisTemplate<String,String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setValueSerializer(new StringRedisSerializer());
        template.setKeySerializer(new StringRedisSerializer());
        return template;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory(){
        RedisStandaloneConfiguration redisStandaloneConfiguration = new RedisStandaloneConfiguration();
        redisStandaloneConfiguration.setHostName(redisProperties.getHost());
        redisStandaloneConfiguration.setPort(redisProperties.getPort());
        redisStandaloneConfiguration.setPassword(redisProperties.getPassword());
        return new LettuceConnectionFactory(redisStandaloneConfiguration);
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            MessageListenerAdapter chatListenerAdapter,
            MessageListenerAdapter inviteListenerAdapter,
            ChannelTopic chatChannelTopic,
            ChannelTopic inviteChannelTopic
    ){
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory());
        container.addMessageListener(chatListenerAdapter,chatChannelTopic);
        container.addMessageListener(inviteListenerAdapter,inviteChannelTopic);
        return container;
    }

    @Bean
    public MessageListenerAdapter chatListenerAdapter(RedisPublisher subscriber){
        return new MessageListenerAdapter(subscriber,"sendMessageToClient");
    }

    @Bean
    public MessageListenerAdapter inviteListenerAdapter(RedisPublisher subscriber){
        return new MessageListenerAdapter(subscriber,"sendInviteToClient");
    }

}
