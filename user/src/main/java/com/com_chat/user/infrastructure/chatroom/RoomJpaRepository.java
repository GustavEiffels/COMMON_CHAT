package com.com_chat.user.infrastructure.chatroom;

import com.com_chat.user.infrastructure.chatroom.enttiy.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomJpaRepository extends JpaRepository<RoomEntity,Long>, RoomRepositoryCustom {
}
