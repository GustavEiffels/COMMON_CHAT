// src/components/RelationActionModal.jsx
import React from 'react';

function RelationActionModal({ isOpen, onClose, relationInfo, onUnfriend, onUnblock, onStartChatWithFriend }) {
  // 모달이 열려있지 않거나, relationInfo (관계 정보) 또는 member 정보가 없으면 렌더링하지 않음
  if (!isOpen || !relationInfo || !relationInfo.member) {
    return null;
  }

  // 모달 오버레이의 CSS 클래스 (isOpen 상태에 따라 'open' 클래스 추가)
  const modalOverlayClass = `modal-overlay ${isOpen ? 'open' : ''}`;
  
  // 모달에 표시될 멤버의 닉네임과 관계 타입 추출
  const memberNick = relationInfo.member.nick;
  const relationType = relationInfo.type; // 'follow' 또는 'block'

  return (
    // 모달 오버레이 클릭 시 모달 닫기 (이벤트 버블링을 막지 않으면 모달 내용 클릭 시에도 닫힐 수 있음)
    <div className={modalOverlayClass} onClick={onClose}>
      {/* 모달 콘텐츠 클릭 시 이벤트 버블링 방지 (모달이 바로 닫히는 것 방지) */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 모달 제목: 클릭된 멤버의 닉네임 */}
        <h3>{memberNick}</h3>
        {/* 모달 설명 텍스트 */}
        <p>님과의 관계를 관리합니다.</p>
        
        {/* 모달 내 액션 버튼들 */}
        <div className="modal-actions">
          {/* 친구 관계일 경우 (relationType === 'follow') 표시될 버튼들 */}
          {relationType === 'follow' && (
            <>
              {/* '채팅하기' 버튼: 친구와 채팅 시작 핸들러 호출 */}
              <button className="modal-button start-chat" onClick={() => onStartChatWithFriend(relationInfo.member)}>채팅하기</button>
              {/* '친구 해제하기' 버튼: 친구 해제 핸들러 호출 */}
              <button className="modal-button unfriend" onClick={() => onUnfriend(relationInfo.relation, relationInfo.member)}>친구 해제하기</button>
            </>
          )}
          
          {/* 차단 관계일 경우 (relationType === 'block') 표시될 버튼들 */}
          {relationType === 'block' && (
            // '차단 해제' 버튼: 차단 해제 핸들러 호출
            <button className="modal-button unblock" onClick={() => onUnblock(relationInfo.relation, relationInfo.member)}>차단 해제</button>
          )}
          
          {/* 공통 취소 버튼: 모달 닫기 핸들러 호출 */}
          <button className="modal-button cancel" onClick={onClose}>취소</button>
        </div>
      </div>
    </div>
  );
}

export default RelationActionModal;