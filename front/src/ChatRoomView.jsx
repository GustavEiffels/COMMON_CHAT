// src/ChatRoomView.jsx

import React, { useState, useEffect, useRef } from 'react';

function ChatRoomView({ room, memberId, memberNick, onClose, className }) { // className prop added
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  useEffect(() => {
    if (room) {
      console.log(`Loading chat for room: ${room.roomTitle} (ID: ${room.roomId})`);
      // Simulating message load. In a real app, fetch from API.
      setMessages([
        { id: 1, sender: 'System', text: `Welcome to ${room.roomTitle}!`, timestamp: new Date() },
      ]);
    }
  }, [room]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: memberNick,
        text: newMessage,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, message]);
      setNewMessage('');
      console.log('Sending message:', message);
      // In a real app, send this message to the server (e.g., via WebSocket)
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