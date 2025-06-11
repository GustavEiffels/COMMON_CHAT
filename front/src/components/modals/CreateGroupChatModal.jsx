// src/components/modals/CreateGroupChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import './CreateGroupChatModal.css';


function CreateGroupChatModal({ isOpen, onClose, onCreate, friends }) {
  const [roomTitle, setRoomTitle] = useState('');
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimatingOut(false);
      const modalWidth = modalRef.current?.offsetWidth || 420;
      const modalHeight = modalRef.current?.offsetHeight || 600;
      setPosition({
        x: (window.innerWidth - modalWidth) / 2,
        y: (window.innerHeight - modalHeight) / 2,
      });
      // 모달이 열릴 때 상태 초기화
      setRoomTitle('');
      setSelectedFriends(new Set());
      setSearchQuery('');
    } else {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        document.body.style.overflow = 'unset';
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleFriendToggle = (friendId) => {
    setSelectedFriends(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(friendId)) {
        newSelected.delete(friendId);
      } else {
        newSelected.add(friendId);
      }
      return newSelected;
    });
  };

  const handleCreateClick = () => {
    onCreate(Array.from(selectedFriends), roomTitle);
  };
  
  // (드래그 관련 핸들러들은 기존과 동일)
  const handleMouseDown = (e) => {
    if (e.target.closest('.header-icon-button, input, .friend-list-container, .modal-footer')) return;
    setIsDragging(true);
    offset.current = {
      x: e.clientX - modalRef.current.getBoundingClientRect().left,
      y: e.clientY - modalRef.current.getBoundingClientRect().top,
    };
  };
  const handleMouseMove = (e) => { if (isDragging) setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y }); };
  const handleMouseUp = () => { setIsDragging(false); };
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);


  if (!isOpen && !isAnimatingOut) {
    return null;
  }

  // ★★★ '만들기' 버튼 활성화 조건에서 채팅방 이름(roomTitle) 검사 로직 제거 ★★★
  const isCreateButtonActive = selectedFriends.size > 0;

  // ★★★ 검색어에 따라 친구 목록 필터링 ★★★
  const filteredFriends = friends.filter(friend =>
    friend.nick.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        ref={modalRef}
        className={`create-chat-modal-container ${isOpen ? 'open' : ''}`}
        style={{ left: position.x, top: position.y }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="chat-header" onMouseDown={handleMouseDown} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
          <div className="header-left"><span className="header-chat-title">단체 채팅방 생성</span></div>
          <div className="header-right">
            <button onClick={onClose} className="header-icon-button close-modal-button">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="room-title-input">채팅방 이름</label>
            <input
              id="room-title-input"
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="단체 채팅방 이름을 입력하세요 (선택 사항)"
            />
          </div>

          <div className="form-group">
            <label>대화 상대 선택 ({selectedFriends.size})</label>
            
            <div className="friend-search-wrapper">
              <input
                type="text"
                className="friend-search-input"
                placeholder="닉네임으로 친구 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="friend-list-container">
              {filteredFriends.length > 0 ? (
                filteredFriends.map(friend => (
                  <div
                    key={friend.memberId}
                    className={`friend-item ${selectedFriends.has(friend.memberId) ? 'selected' : ''}`}
                    onClick={() => handleFriendToggle(friend.memberId)}
                  >
                    <div className="friend-avatar">
                      <span>{friend.nick.charAt(0)}</span>
                    </div>
                    <div className="friend-info">
                      <span className="friend-nick">{friend.nick}</span>
                      <span className="friend-detail">친구 상태 메시지 또는 이메일</span>
                    </div>
                    <div className={`checkbox-custom ${selectedFriends.has(friend.memberId) ? 'checked' : ''}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="footer-button cancel-button">취소</button>
          <button
            onClick={handleCreateClick}
            className={`footer-button create-button`}
            disabled={!isCreateButtonActive}
          >
            만들기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupChatModal;
