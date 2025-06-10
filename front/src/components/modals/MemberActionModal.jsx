import React from 'react';

function MemberActionModal({ isOpen, onClose, member, onAddFriend, onBlockMember, onStartPrivateChat }) {
  if (!member) {
    return null;
  }
  const modalOverlayClass = `modal-overlay ${isOpen ? 'open' : ''}`;

  return (
    <div className={modalOverlayClass} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{member.nick}</h3>
        <p>님에게 어떤 작업을 수행하시겠습니까?</p>
        <div className="modal-actions">
          <button className="modal-button start-chat" onClick={() => onStartPrivateChat(member)}>개인 채팅하기</button>
          <button className="modal-button add-friend" onClick={() => onAddFriend(member)}>친구 추가</button>
          <button className="modal-button block-member" onClick={() => onBlockMember(member)}>차단</button>
          <button className="modal-button cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default MemberActionModal;