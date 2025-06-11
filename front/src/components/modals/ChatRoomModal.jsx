// src/components/modals/ChatRoomModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ChatRoomModal.css';

function ChatRoomModal({ isOpen, onClose, room, memberId, memberNick }) {
  // 스크린샷에 맞춰 빈 문자열로 초기화
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({
    x: (window.innerWidth - 380) / 2,
    y: (window.innerHeight - 700) / 2
  });
  const offset = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimatingOut(false);
      const modalWidth = modalRef.current?.offsetWidth || 380;
      const modalHeight = modalRef.current?.offsetHeight || 700;
      setPosition({
          x: (window.innerWidth - modalWidth) / 2,
          y: (window.innerHeight - modalHeight) / 2
      });
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        document.body.style.overflow = 'unset';
        if (!isOpen) {
          setMessages([]);
          setNewMessage(''); // 닫힐 때도 빈 문자열로 초기화
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && room) {
      console.log(`Loading chat for room: ${room.roomTitle} (ID: ${room.roomId})`);
      // 새로운 스크린샷에 맞춰 메시지 데이터 업데이트
      setMessages([
        { id: 1, type: 'link', sender: 'OtherUser', text: 'https://www.instagram.com/reel/DKOr5c_SeAC/?igsh=MWh6cxgwQXh1OHdseQ==', timestamp: new Date('2025-06-11T01:26:00') },
      ]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isOpen, room]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.header-icon-button') || e.target.closest('.header-chat-title')) {
      return;
    }
    setIsDragging(true);
    offset.current = {
      x: e.clientX - modalRef.current.getBoundingClientRect().left,
      y: e.clientY - modalRef.current.getBoundingClientRect().top,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        type: 'text',
        sender: memberNick,
        text: newMessage,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
      console.log('Sending message:', message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen && !isAnimatingOut) {
    return null;
  }

  const chatTitle = room?.roomType === 'PRIVATE' ? room.roomTitle : room?.roomTitle || '채팅방';
  // Send 버튼은 메시지 내용이 있을 때만 활성화 (기존 로직 복원)
  const isSendButtonActive = newMessage.trim().length > 0;

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={onClose}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        className={`chat-modal-container ${isOpen ? 'open' : ''}`}
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 영역 */}
        <div
          className="chat-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="header-left">
            <span className="header-chat-title">{chatTitle}</span>
          </div>
          <div className="header-right">
            <button onClick={onClose} className="header-icon-button close-modal-button">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        {/* 메시지 바디 */}
        <div className="modal-body">
          <div className="chat-messages-container">
            {messages.map((msg) => {
              if (msg.type === 'date') {
                return <div key={msg.id} className="chat-date-divider">{msg.date}</div>;
              }

              const isMyMessage = msg.sender === memberNick;
              const timeString = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

              return (
                <div key={msg.id} className={`chat-message ${isMyMessage ? 'my-message' : 'other-message'}`}>
                  <div className="message-bubble-wrapper">
                    {!isMyMessage && <span className="message-sender">{msg.sender}</span>}
                    <div className="message-content-bubble">
                      {msg.type === 'text' && <p className="message-text">{msg.text}</p>}
                      {msg.type === 'file' && (
                        <div className="message-file">
                          <div className="file-info">
                            <span className="file-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
                            </span>
                            <span className="file-name">{msg.text}</span>
                            <span className="file-details">Expiry : {msg.expiry} | Size: {msg.size}</span>
                          </div>
                          <div className="file-actions">
                            <button className="file-save-button">Save</button>
                            <button className="file-save-as-button">Save As</button>
                          </div>
                        </div>
                      )}
                      {msg.type === 'link' && (
                        <a href={msg.text} target="_blank" rel="noopener noreferrer" className="message-link">
                          {msg.text}
                        </a>
                      )}
                    </div>
                  </div>
                  {/* 스크린샷에 따라 메시지 버블 아래에 시간 표시 (다시 활성화) */}
                  <span className="message-timestamp">{timeString}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 하단 입력 영역 */}
        <div className="chat-input-footer">
          <div className="input-message-area">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a message"
              rows="1"
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <button
              onClick={handleSendMessage}
              className={`send-message-button ${isSendButtonActive ? 'active' : ''}`}
              disabled={!isSendButtonActive}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomModal;