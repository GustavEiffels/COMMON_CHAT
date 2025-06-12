// src/components/modals/ChatRoomModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import './ChatRoomModal.css';

// 채팅 API의 기본 URL을 직접 정의합니다. (localhost:8888)
const CHAT_API_BASE_URL = 'http://localhost:8888';

// MessageEnum.LoadType을 프론트엔드에서 정의
const MessageLoadType = {
  FIRST: 'FIRST', // 초기 로딩 (가장 최신 메시지들)
  NOT_FIRST: 'NOT_FIRST', // 이전 메시지 로딩 (스크롤 올릴 때)
  NEW: 'NEW'      // 새 메시지 로딩 (특정 시점 이후 메시지 로딩, 여기서는 사용 안함)
};

function ChatRoomModal({ isOpen, onClose, room, memberId, memberNick, stompClient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null); // 메시지 리스트의 가장 하단으로 스크롤하기 위한 ref
  const messagesContainerRef = useRef(null); // 메시지 스크롤 컨테이너 ref (무한 스크롤 감지용)
  const subscriptionRef = useRef(null); // STOMP 구독 객체를 저장하기 위한 ref (이 컴포넌트에서는 사용 안 함)
  const modalRef = useRef(null); // 모달 DOM 요소를 참조하기 위한 ref (드래그용)
  const isDragging = useRef(false); // 현재 드래그 중인지 여부
  const offset = useRef({ x: 0, y: 0 }); // 마우스 클릭 지점과 모달 상단-좌측 간의 오프셋
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%' }); // 모달의 현재 위치

  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // 메시지 로딩 중인지 여부
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // 더 로드할 메시지가 있는지 여부 (무한 스크롤)

  // ★ 추가: 모달이 한 번이라도 열려 초기 메시지를 로드했는지 추적하는 Ref
  const hasOpenedOnceRef = useRef(false);

  // --- 드래그 관련 핸들러 ---
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.chat-header')) { // 헤더에서만 드래그 가능하도록 제한
      if (modalRef.current) {
        isDragging.current = true;
        const rect = modalRef.current.getBoundingClientRect();
        offset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        modalRef.current.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
      }
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
    setModalPosition({ top: `${newTop}px`, left: `${newLeft}px` });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (modalRef.current) {
      modalRef.current.style.cursor = 'grab'; // 드래그 종료 시 커서 변경
    }
    document.body.style.userSelect = ''; // 드래그 종료 시 텍스트 선택 허용
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (modalRef.current) {
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
  }, [isOpen, handleMouseMove, handleMouseUp, modalPosition.top, modalPosition.left]);

  // --- 메시지 로드 함수 (API 호출) ---
  const fetchMessages = useCallback(async (roomId, loadType, count, currentMinCnt = null) => {
    if (!roomId || isLoadingMessages) {
        console.log("fetchMessages: Aborting due to no room ID or already loading.", { roomId, isLoadingMessages });
        return;
    }

    setIsLoadingMessages(true); // 로딩 시작
    const initialScrollHeight = messagesContainerRef.current ? messagesContainerRef.current.scrollHeight : 0;

    try {
      // JWT 토큰 관련 로직은 제거됨. 백엔드에서 인증을 요구하지 않는다고 가정합니다.
      const requestBody = {
        roomId: roomId,
        count: count,
        type: loadType,
        currentMinCnt: currentMinCnt // PREV 로딩 시에만 사용될 값
      };

      console.log("Fetching messages with requestBody:", requestBody);

      const response = await fetch(`${CHAT_API_BASE_URL}/message/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${accessToken}` // 이 라인은 제거됨
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json(); // 응답 본문을 JSON으로 파싱
      console.log('API Response data: ', data); // 응답 구조 확인용 로그

      // 서버 응답 성공 (HTTP response.ok & data.error가 없을 때)
      if (response.ok && !data.error) { // data.status === 200 조건은 response.ok에 포함되므로 제거 가능
        const fetchedMessages = data.messageList || []; // data.messageList로 접근 수정
        const parsedMessages = fetchedMessages.map(msg => ({
          ...msg,
          createDateTime: msg.createDateTime ? new Date(msg.createDateTime) : new Date(),
          createDate: msg.createDate ? new Date(msg.createDate) : new Date()
        }));

        console.log('i wanna sleep')

        if (loadType === MessageLoadType.FIRST) {
          setMessages(parsedMessages); // 초기 로딩: 기존 메시지들을 새로 가져온 메시지들로 대체
        } else if (loadType === MessageLoadType.NOT_FIRST) { // PREV 대신 NOT_FIRST 사용
          setMessages(prevMessages => [...parsedMessages, ...prevMessages]); // 이전 로딩: 기존 메시지 앞에 새 메시지들을 추가

          // 스크롤 위치 유지 로직
          if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              messagesContainerRef.current.scrollTop = newScrollHeight - initialScrollHeight;
          }
        }

        setHasMoreMessages(parsedMessages.length > 0); // 가져온 메시지가 0개면 더 이상 메시지 없음

        if (parsedMessages.length > 0) {
            toast.success(`메시지를 ${parsedMessages.length}개 로드했습니다.`);
        } else {
            toast.info('더 이상 메시지가 없습니다.');
        }

      } else { // 서버 응답이 실패했거나 비즈니스 로직 오류 (data.error 존재)
        const errorMessage = data.error ? data.error.message : (data.message || '메시지 로드 실패: 알 수 없는 오류');
        // HTTP 상태 코드에 따른 에러 처리 및 리디렉션 로직도 여기서는 제거됨
        toast.error(errorMessage || `API 오류: ${response.status}`);
        setHasMoreMessages(false);
      }
    } catch (error) { // 네트워크 오류 등 fetch 자체가 실패했을 때
      console.error('메시지 로드 중 네트워크 오류 발생:', error);
      toast.error('메시지 로드 중 네트워크 오류가 발생했습니다.');
      setHasMoreMessages(false);
    } finally {
      setIsLoadingMessages(false); // 로딩 상태 종료
    }
  }, [isLoadingMessages]); // `isLoadingMessages`만 의존성으로 두어 불필요한 재렌더링 방지.

  // --- 모달 열릴 때 초기 메시지 로드 (한 번만 수행) ---
  useEffect(() => {
    // `isOpen`이 true이고, `room.roomId`가 유효하며,
    // 아직 한 번도 초기 로딩을 하지 않았을 때만 `fetchMessages`를 호출합니다.
    if (isOpen && room?.roomId && !hasOpenedOnceRef.current) {
      setMessages([]); // 방이 변경될 때마다 메시지 초기화 (새로운 방을 열 때마다 초기화)
      setHasMoreMessages(true); // 새 방이 열리면 더 로드할 메시지가 있다고 가정

      fetchMessages(room.roomId, MessageLoadType.FIRST, 20); // 해당 방의 초기 (가장 최신) 메시지를 로드 (count: 20으로 가정)

      hasOpenedOnceRef.current = true; // 초기 로딩이 시작되었음을 표시
    } else if (!isOpen) {
        // 모달이 닫힐 때 `hasOpenedOnceRef`를 `false`로 초기화하면
        // 다음번에 모달을 다시 열 때 `fetchMessages`가 다시 실행됩니다.
        // 만약 모달을 닫았다 열어도 메시지 기록을 유지하고 싶다면 이 라인을 주석 처리합니다.
        hasOpenedOnceRef.current = false;
    }

    // 클린업 함수 (STOMP 구독 제거되었으므로 여기서는 불필요)
    return () => { };
  }, [isOpen, room, fetchMessages]); // `fetchMessages`는 `useCallback`으로 감싸져 있으므로 여기에 포함.

  // --- 메시지 스크롤 하단 고정 ---
  useEffect(() => {
    if (isOpen && messages.length > 0 && !isLoadingMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoadingMessages]);

  // --- 스크롤 이벤트 핸들러 (무한 스크롤) ---
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;

      // 스크롤이 맨 위로 올라갔고 (scrollTop === 0),
      // 현재 로딩 중이 아니며 (!isLoadingMessages),
      // 더 로드할 메시지가 있으며 (hasMoreMessages),
      // 메시지가 최소 하나 이상 있을 때 (messages.length > 0)
      if (scrollTop === 0 && !isLoadingMessages && hasMoreMessages && messages.length > 0) {
        const oldestMsgRoomCnt = messages[0].msgRoomCnt; // 현재 보이는 메시지 중 가장 오래된 (가장 작은) msgRoomCnt

        // msgRoomCnt가 1보다 클 때만 이전 메시지 로드 시도 (msgRoomCnt는 1부터 시작한다고 가정)
        if (oldestMsgRoomCnt !== undefined && oldestMsgRoomCnt > 1) {
          fetchMessages(room.roomId, MessageLoadType.NOT_FIRST, 20, oldestMsgRoomCnt); // 이전 메시지 로드
        } else {
          // msgRoomCnt가 1이거나 그 이하면 더 이상 이전 메시지가 없다고 판단
          setHasMoreMessages(false);
          toast.info('더 이상 이전 메시지가 없습니다.');
        }
      }
    }
  }, [isLoadingMessages, hasMoreMessages, messages, room?.roomId, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // --- 메시지 전송 핸들러 ---
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
        // 클라이언트에서 메시지 전송 후 즉시 UI 업데이트 (낙관적 업데이트)
        // 실제로는 서버에서 브로드캐스트된 메시지를 수신하여 UI 업데이트하는 것이 더 정확하지만,
        // 이 컴포넌트에서는 STOMP 구독을 제거했으므로 이 방식이 필요합니다.
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(), // 임시 고유 ID
            sender: memberNick, // 현재 사용자의 닉네임
            messageContents: messagePayload.messageContents,
            userPid: memberId,
            roomPid: room.roomId,
            createDateTime: new Date(),
            createDate: new Date(),
            msgRoomCnt: null // 서버에서 부여될 값이므로 임시로 null
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

  // --- 날짜 변경 감지 및 날짜 구분선 렌더링 로직 ---
  const renderMessagesWithDateDividers = () => {
    let lastDate = null;
    const elements = [];

    // 메시지를 msgRoomCnt 기준으로 오름차순으로 정렬합니다.
    const sortedMessages = [...messages].sort((a, b) => a.msgRoomCnt - b.msgRoomCnt);

    sortedMessages.forEach((msg) => {
      const messageDate = msg.createDate instanceof Date && !isNaN(msg.createDate.getTime())
                            ? msg.createDate.toDateString()
                            : null;

      if (messageDate && messageDate !== lastDate) {
        elements.push(
          <div key={`date-divider-${messageDate}`} className="chat-date-divider">
            {msg.createDate instanceof Date && !isNaN(msg.createDate.getTime())
                ? msg.createDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                : '날짜 오류'}
          </div>
        );
        lastDate = messageDate;
      }

      const senderNickToDisplay = msg.sender || '알 수 없음';
      console.log('msg.userPid ',msg.userPid)
      console.log('memberId ',memberId)
      console.log('msg.userPid == memberId ',msg.userPid == memberId)
      elements.push(
        <div
          key={msg.id || `${msg.userPid}-${msg.createDateTime?.getTime() || Date.now()}`}
          className={`chat-message ${msg.userPid == memberId ? 'my-message' : 'other-message'}`}
        >
          {msg.userPid != memberId && ( // 상대방 메시지
            <div className="message-bubble-wrapper">
              <span className="message-sender">{senderNickToDisplay}</span>
              <div className="message-content-bubble">
                <p className="message-text">{msg.messageContents}</p>
              </div>
            </div>
          )}
          <span className="message-timestamp">
            {msg.createDateTime instanceof Date && !isNaN(msg.createDateTime.getTime())
              ? msg.createDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
          {msg.userPid == memberId && ( // 내 메시지
            <div className="message-bubble-wrapper">
              <div className="message-content-bubble">
                <p className="message-text">{msg.messageContents}</p>
              </div>
            </div>
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
                <path d="M6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L12 10.5858L16.2929 6.29289C16.6834 5.90237 17.3166 5.90237 17.7071 6.29289C18.0976 6.68342 18.0976 7.31658 17.7071 7.70711L13.4142 12L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12 13.4142L7.70711 17.7071C7.31658 18.0976 6.68342 18.0976 6.29289 6.29289Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="chat-messages-container" ref={messagesContainerRef}>
            {isLoadingMessages && (
              <div style={{ textAlign: 'center', padding: '10px', color: '#666', fontSize: '0.9em' }}>
                <span className="loading-spinner"></span> 이전 메시지 로딩 중...
              </div>
            )}
            {!isLoadingMessages && !hasMoreMessages && messages.length > 0 && (
              <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '0.8em' }}>
                더 이상 이전 메시지가 없습니다.
              </div>
            )}
            {renderMessagesWithDateDividers()}
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