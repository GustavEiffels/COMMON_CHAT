// src/components/ChatRoomList.jsx
import React from 'react';

// onRoomClick prop 추가
function ChatRoomList({ title, rooms, type, onRoomClick }) {
  if (!rooms || rooms.length === 0) {
    return <p className="no-data-message">아직 {title}이 없습니다.</p>;
  }

  return (
    <div className="list-section">
      <h3>{title}</h3>
      <ul className="item-list">
        {rooms.map((room) => (
          // ★★★ onClick 이벤트 추가 ★★★
          <li key={room.roomId} onClick={() => onRoomClick(room)} style={{ cursor: 'pointer' }}>
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