// src/components/modals/ChatRoomModal.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import './ChatRoomModal.css';

function ChatRoomModal({ isOpen, onClose, room, memberId, memberNick, stompClient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const modalRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%' });

  // 드래그 관련 핸들러는 그대로 유지
  const handleMouseDown = useCallback((e) => {
    if (modalRef.current) {
      isDragging.current = true;
      const rect = modalRef.current.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      modalRef.current.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;

    let newLeft = e.clientX - offset.current.x;
    let newTop = e.clientY - offset.current.y;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = modalRef.current.offsetWidth;
    const modalHeight = modalRef.current.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - modalWidth));
    newTop = Math.max(0, Math.min(newTop, viewportHeight - modalHeight));

    setModalPosition({
      top: `${newTop}px`,
      left: `${newLeft}px`,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (modalRef.current) {
      modalRef.current.style.cursor = 'grab';
    }
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (modalRef.current) {
        // 모달이 처음 열릴 때 중앙에 오도록 한 번 더 계산 (새로고침 시 등)
        const rect = modalRef.current.getBoundingClientRect();
        setModalPosition({
          top: `calc(50% - ${rect.height / 2}px)`,
          left: `calc(50% - ${rect.width / 2}px)`,
        });
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      isDragging.current = false;
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);


  // STOMP 연결 및 메시지 구독 로직
  useEffect(() => {
    if (!isOpen) return;

    if (room && stompClient && stompClient.connected) {
      console.log(`Loading chat for room: ${room.roomTitle} (ID: ${room.roomId})`);
      setMessages([]);

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`Unsubscribed from previous room: ${room.roomId}`);
      }

      const subscribePath = `/receive/chat/room/${room.roomId}`;
      subscriptionRef.current = stompClient.subscribe(subscribePath, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log(`Received message in ChatRoomModal for room ${room.roomId}:`, receivedMessage);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: receivedMessage.messageId || Date.now(),
            sender: receivedMessage.senderNick || 'Unknown',
            text: receivedMessage.messageContents,
            timestamp: new Date(receivedMessage.sendAt || Date.now()),
          },
        ]);
      }, { id: `sub-${room.roomId}` });

      console.log(`Subscribed to chat room: ${subscribePath}`);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        console.log(`Unsubscribed from room: ${room.roomId}`);
      }
    };
  }, [isOpen, room, stompClient, memberNick]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && stompClient.connected) {
      const messagePayload = {
        messageContents: newMessage.trim(),
        userPid: memberId,
        roomPid: room.roomId,
      };

      const destination = `/send/`;

      try {
        stompClient.send(destination, {}, JSON.stringify(messagePayload));
        setNewMessage('');
        console.log('Message sent:', messagePayload);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 날짜 변경 감지 및 날짜 구분선 렌더링 로직 (여기서는 간단화)
  const renderMessagesWithDateDividers = () => {
    let lastDate = null;
    const elements = [];

    messages.forEach((msg, index) => {
      const messageDate = new Date(msg.timestamp).toDateString();
      if (messageDate !== lastDate) {
        elements.push(
          <div key={`date-${messageDate}`} className="chat-date-divider">
            {new Date(msg.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        );
        lastDate = messageDate;
      }

      elements.push(
        <div
          key={msg.id}
          className={`chat-message ${msg.sender === memberNick ? 'my-message' : 'other-message'}`}
        >
          {msg.sender !== memberNick && ( // 상대방 메시지일 경우에만 닉네임 표시
            <div className="message-bubble-wrapper">
              <span className="message-sender">{msg.sender}</span>
              <div className="message-content-bubble">
                <p className="message-text">{msg.text}</p>
              </div>
            </div>
          )}
          {msg.sender === memberNick && ( // 내 메시지
            <>
              <span className="message-timestamp">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="message-bubble-wrapper">
                <div className="message-content-bubble">
                  <p className="message-text">{msg.text}</p>
                </div>
              </div>
            </>
          )}
          {msg.sender !== memberNick && ( // 상대방 메시지일 때 시간 표시
            <span className="message-timestamp">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      );
    });
    return elements;
  };


  if (!isOpen || !room) {
    return null;
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div
        ref={modalRef}
        className="chat-modal-container"
        style={modalPosition}
      >
        <div className="chat-header" onMouseDown={handleMouseDown}>
          <div className="header-left">
            <h3 className="header-chat-title">{room.roomTitle}</h3>
          </div>
          <div className="header-right">
            <button onClick={onClose} className="header-icon-button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L12 10.5858L16.2929 6.29289C16.6834 5.90237 17.3166 5.90237 17.7071 6.29289C18.0976 6.68342 18.0976 7.31658 17.7071 7.70711L13.4142 12L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12 13.4142L7.70711 17.7071C7.31658 18.0976 6.68342 18.0976 6.29289 16.2929L10.5858 12L6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="chat-messages-container">
            {renderMessagesWithDateDividers()} {/* 날짜 구분선과 메시지 렌더링 함수 호출 */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-footer">
          <div className="input-message-area">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows="1"
            />
            <button
              onClick={handleSendMessage}
              className={`send-message-button ${newMessage.trim() ? 'active' : ''}`}
              disabled={!newMessage.trim()}
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomModal;