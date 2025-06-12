// src/ChatRoomView.jsx

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify'; // toast 메시지를 위해 추가

// stompClient prop을 받도록 수정
function ChatRoomView({ room, memberId, memberNick, onClose, className, stompClient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // 이 roomId를 구독하기 위한 변수를 추가합니다.
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (room && stompClient && stompClient.connected) {
      console.log(`Loading chat for room: ${room.roomTitle} (ID: ${room.roomId})`);
      // 메시지 초기화
      setMessages([]);

      // 기존 구독이 있다면 해제
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`Unsubscribed from previous room: ${room.roomId}`);
      }

      // 새로운 채팅방 구독
      const subscribePath = `/receive/chat/room/${room.roomId}`;
      subscriptionRef.current = stompClient.subscribe(subscribePath, (message) => {
        // 메시지 수신 시 처리
        const receivedMessage = JSON.parse(message.body);
        console.log(`Received message in ChatRoomView for room ${room.roomId}:`, receivedMessage);
        // 서버에서 오는 메시지 형식에 따라 파싱 및 상태 업데이트
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: receivedMessage.messageId || Date.now(), // 고유 ID가 없다면 Date.now() 사용
            sender: receivedMessage.senderNick || 'Unknown', // 서버에서 보낸 사람 닉네임
            text: receivedMessage.messageContents,
            timestamp: new Date(receivedMessage.sendAt || Date.now()), // 메시지 전송 시각
          },
        ]);
        // toast.info(`새 메시지: ${receivedMessage.messageContents}`); // 필요에 따라 토스트 알림
      }, { id: `sub-${room.roomId}` }); // 구독을 식별할 수 있는 ID 부여

      console.log(`Subscribed to chat room: ${subscribePath}`);
    }

    // 컴포넌트 언마운트 시 또는 room 변경 시 구독 해제
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`Unsubscribed from room: ${room.roomId}`);
      }
    };
  }, [room, stompClient, memberNick]); // room, stompClient, memberNick이 변경될 때마다 훅 실행

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && stompClient.connected) {
      const messagePayload = {
        messageContents: newMessage.trim(),
        userPid: memberId, // 현재 로그인한 사용자의 ID
        roomPid: room.roomId, // 현재 채팅방의 ID
      };

      // STOMP send 메서드를 사용하여 메시지 전송
      // 서버의 @MessageMapping("/") 에 맞게 destination을 설정합니다.
      // @MessageMapping 어노테이션은 "/send" prefixes가 설정되어 있으므로, 실제 경로는 "/send/" + 매핑 경로가 됩니다.
      // 즉, `registry.setApplicationDestinationPrefixes("/send");` 와 `@MessageMapping("/")` 이 합쳐져서 `/send/` 가 됩니다.
      const destination = `/send/`; // 서버의 @MessageMapping("/") 경로에 맞춤

      try {
        stompClient.send(destination, {}, JSON.stringify(messagePayload));
        setNewMessage('');
        console.log('Message sent:', messagePayload);
        // 메시지를 성공적으로 보내면 UI에 바로 추가 (선택 사항, 서버 응답을 기다릴 수도 있음)
        // 실제로는 서버에서 메시지를 다시 브로드캐스트하는 것을 수신하여 UI에 추가하는 것이 좋습니다.
        // 여기서는 빠른 사용자 경험을 위해 즉시 추가합니다.
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(), // 임시 ID
            sender: memberNick,
            text: messagePayload.messageContents,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Failed to send message via STOMP:", error);
        toast.error("메시지 전송에 실패했습니다.");
      }
    } else if (!stompClient || !stompClient.connected) {
      toast.warn("WebSocket 연결이 활성화되지 않았습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Prevent new line on simple Enter
      e.preventDefault(); // Prevent default Enter behavior (e.g., new line in textarea)
      handleSendMessage();
    }
  };

  if (!room) {
    return null; // Don't render anything if no room is active
  }

  return (
    <div className={`chat-room-view ${className}`}> {/* Apply className for transition */}
      <div className="chat-header">
        <h3>{room.roomTitle}</h3>
        <button onClick={onClose} className="close-chat-button">X</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === memberNick ? 'my-message' : 'other-message'}`}>
            <span className="sender">{msg.sender === memberNick ? '나' : msg.sender}:</span>
            <p className="message-text">{msg.text}</p>
            <span className="timestamp">{msg.timestamp.toLocaleTimeString()}</span>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>
      <div className="chat-input-area"> {/* New wrapper for textarea and button */}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
          rows="3" // Set initial rows
        />
        <button onClick={handleSendMessage}>전송</button>
      </div>
    </div>
  );
}

export default ChatRoomView;