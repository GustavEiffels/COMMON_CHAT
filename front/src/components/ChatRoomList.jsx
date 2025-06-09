// src/components/ChatRoomList.jsx
import React from 'react';

function ChatRoomList({ title, rooms, type }) {
  if (!rooms || rooms.length === 0) {
    return <p className="no-data-message">아직 {title}이 없습니다.</p>;
  }

  return (
    <div className="list-section">
      <h3>{title}</h3>
      <ul className="item-list">
        {rooms.map((room) => (
          <li key={room.roomId}>
            <span>{room.roomTitle}</span>
            <span className={`type ${type === 'private' ? 'private' : 'multi'}`}>
              {room.roomType === 'PRIVATE' ? '1:1 채팅' : '단체 채팅'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatRoomList;