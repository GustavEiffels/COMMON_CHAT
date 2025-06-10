// src/ChatRoomView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
// WebSocket/STOMP 관련 라이브러리 (npm install @stomp/stompjs sockjs-client)
import { Client } from '@stomp/stompjs'; // STOMP 클라이언트
import SockJS from 'sockjs-client'; // SockJS

// NOTE: 이 컴포넌트는 HomePage와 독립적으로 작동할 수 있도록 설계되었지만,
// 현재 HomePage에서 직접 제어하므로 props를 통해 필요한 정보(roomId, memberId 등)를 받습니다.

function ChatRoomView({ roomId, roomTitle, currentMemberId, onRoomClose }) {
  const [messages, setMessages] = useState([]); // 채팅 메시지 목록
  const [newMessage, setNewMessage] = useState(''); // 입력 중인 메시지
  const stompClient = useRef(null); // STOMP 클라이언트 인스턴스

  const messagesEndRef = useRef(null); // 메시지 스크롤 하단 고정용

  // ★★★ 백엔드 WebSocket 엔드포인트 URL ★★★
  // StompConfig에 설정된 기본 엔드포인트와 일치해야 합니다.
  const WEB_SOCKET_URL = 'http://localhost:8080/chat'; // (혹은 환경 변수에서 가져올 수 있음)

  useEffect(() => {
    // roomId나 currentMemberId가 없으면 연결 시도 안함
    if (!roomId || !currentMemberId) {
      toast.error('채팅방 정보가 부족합니다.');
      onRoomClose(); // 방 닫기
      return;
    }

    // 채팅방 입장 시 WebSocket 연결 및 구독
    const client = new Client({
      webSocketFactory: () => new SockJS(WEB_SOCKET_URL),
      debug: (str) => { console.log(str); }, // STOMP 클라이언트 디버그 로그
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        toast.success(`채팅방 "${roomTitle}"에 연결되었습니다.`);
        // 구독: /receive/room/{roomId} 토픽
        client.subscribe(`/receive/room/${roomId}`, (message) => {
          // 서버에서 받은 메시지를 파싱하여 메시지 목록에 추가
          const receivedMsg = JSON.parse(message.body);
          setMessages(prevMessages => [...prevMessages, receivedMsg]);
        });
        // 초기 메시지 로딩 API 호출 (백엔드에 채팅방 메시지 내역 조회 API가 있다면)
        // api.getChatHistory(roomId).then(history => setMessages(history));
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        toast.error('채팅 연결 중 오류 발생.');
        onRoomClose(); // 오류 발생 시 방 닫기
      },
      onDisconnect: () => {
        console.log('Disconnected from STOMP broker');
        toast.warn('채팅 연결이 끊어졌습니다.');
      }
    });

    stompClient.current = client;
    client.activate(); // STOMP 클라이언트 활성화 (연결 시작)

    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate(); // STOMP 클라이언트 비활성화 (연결 해제)
        toast.info(`채팅방 "${roomTitle}"에서 나갔습니다.`);
      }
    };
  }, [roomId, roomTitle, currentMemberId, onRoomClose]); // 의존성 배열에 onRoomClose 추가

  // 메시지 목록 업데이트 시 스크롤 하단으로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const sendMessage = () => {
    if (stompClient.current && stompClient.current.connected && newMessage.trim()) {
      const messagePayload = {
        roomId: roomId,
        senderId: currentMemberId, // 현재 로그인한 사용자 ID
        content: newMessage.trim(),
        // 기타 필드 (예: timestamp)
      };
      
      // 메시지 전송: /send/message (백엔드 ChatController의 @MessageMapping("/message") 또는 "/")
      // 백엔드에서 이 메시지를 Redis로 발행하고, RedisSubscriber가 다시 해당 방으로 전달
      stompClient.current.publish({
        destination: `/send/message`, // 백엔드 STOMP MessageMapping 경로
        body: JSON.stringify(messagePayload),
      });

      setNewMessage(''); // 입력창 초기화
    } else {
      toast.warn('메시지를 입력하거나 채팅방에 연결되지 않았습니다.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-room-view">
      <div className="chat-room-header">
        <h3>{roomTitle}</h3>
        <button onClick={onRoomClose}>닫기</button> {/* 채팅방 닫기 버튼 */}
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message-item ${String(msg.senderId) === String(currentMemberId) ? 'sent' : 'received'}`}>
            <div className="chat-message-sender">{msg.senderId}</div>
            <div className="chat-message-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* 스크롤 하단으로 이동 타겟 */}
      </div>
      <div className="chat-input-area">
        <input
          type="text"
          placeholder="메시지 입력..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}

export default ChatRoomView;