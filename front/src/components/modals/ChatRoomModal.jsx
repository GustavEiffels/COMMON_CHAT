// src/components/modals/ChatRoomModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import './ChatRoomModal.css';
import api from '../../api';

const CHAT_API_BASE_URL = 'http://localhost:8888';
const MEMBER_API_BASE_URL = 'http://localhost:8080'; 

const MessageLoadType = {
  FIRST: 'FIRST',     // 초기 로딩 (가장 최신 메시지들)
  NOT_FIRST: 'NOT_FIRST', // 이전 메시지 로딩 (스크롤 올릴 때)
  NEW: 'NEW'          // 새 메시지 로딩 (특정 시점 이후 메시지 로딩, 여기서는 사용 안함)
};

// chatModalAddMessageRef prop을 추가합니다.
function ChatRoomModal({ isOpen, onClose, room, memberId, memberNick, stompClient, chatModalAddMessageRef }) {
  // --- 상태(State) 변수 정의 ---
  const [messages, setMessages] = useState([]); // 현재 채팅방의 메시지 목록
  const [newMessage, setNewMessage] = useState(''); // 사용자가 입력 중인 새 메시지 내용
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%' }); // 모달의 현재 위치 (드래그용)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false); // 메시지 로딩 중인지 여부
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // 더 로드할 이전 메시지가 있는지 여부 (무한 스크롤)

  // ★★★ memberId와 nick 매핑을 위한 상태 (localStorage와 동기화) ★★★
  // 컴포넌트 초기화 시 localStorage에서 'memberInfoList'를 로드하여 Map 형태로 변환합니다.
  // Map은 memberId로 닉네임을 빠르게 찾을 수 있게 해줍니다.
  const [memberInfoMap, setMemberInfoMap] = useState(() => {
    try {
      const storedMemberInfo = localStorage.getItem('memberInfoList');
      return storedMemberInfo ? new Map(JSON.parse(storedMemberInfo).map(info => [info.memberId, info.nick])) : new Map();
    } catch (e) {
      console.error("Failed to parse memberInfoList from localStorage:", e);
      return new Map();
    }
  });

  // --- Ref 변수 정의 ---
  const messagesEndRef = useRef(null); // 메시지 목록의 가장 하단으로 스크롤하기 위한 Ref
  const messagesContainerRef = useRef(null); // 메시지 스크롤 컨테이너 Ref (무한 스크롤 감지용)
  const subscriptionRef = useRef(null); // STOMP 구독 객체를 저장하기 위한 Ref (여기서는 직접 사용하지 않음)
  const modalRef = useRef(null); // 모달 DOM 요소를 참조하기 위한 Ref (드래그용)
  const isDragging = useRef(false); // 현재 모달이 드래그 중인지 여부
  const offset = useRef({ x: 0, y: 0 }); // 마우스 클릭 지점과 모달 상단-좌측 간의 오프셋 (드래그용)
  const hasOpenedOnceRef = useRef(false); // 모달이 한 번이라도 열려 초기 메시지를 로드했는지 추적하는 Ref

  // --- 유틸리티 함수: 닉네임 조회 및 저장 ---
  // 특정 memberId의 닉네임을 백엔드에서 조회하고, 로컬 상태(memberInfoMap) 및 localStorage에 저장하는 함수
  const fetchAndStoreMemberNick = useCallback(async (targetMemberId) => {
  // 닉네임이 없거나 이미 Map에 존재하면 불필요한 API 호출을 방지하기 위해 즉시 반환
  // targetMemberId == memberId 조건은 현재 로그인된 사용자의 닉네임을 다시 가져오지 않기 위함
  if (!targetMemberId || memberInfoMap.has(targetMemberId) || targetMemberId == memberId) {
    console.log(`Skipping fetch for memberId ${targetMemberId}: already in map, null, or is current user.`);
    return;
  }

  try {
    console.log(`Fetching nick for memberId: ${targetMemberId} using authenticatedRequest.`);

    // api.authenticatedRequest를 사용하여 API 호출
    // 이 함수가 내부적으로 Authorization 헤더를 관리하고 토큰 만료 시 재발급 로직을 수행합니다.
    const result = await api.authenticatedRequest(
      `${MEMBER_API_BASE_URL}/members/search/info`,
      {
        method: 'POST',
        body: JSON.stringify({ memberId: targetMemberId }),
      }
    );

    console.log('API Response data:', result);

    // api.authenticatedRequest의 반환 값은 { success, message, data, status } 형식입니다.
    if (result.success && result.data && result.data.memberInfo && result.data.memberInfo.nick) {
      const fetchedNick = result.data.memberInfo.nick;
      // setMemberInfoMap을 사용하여 기존 Map을 복사하고 새 닉네임을 추가/업데이트
      setMemberInfoMap(prevMap => {
        const newMap = new Map(prevMap); // 기존 Map을 복사하여 새 Map 생성
        newMap.set(targetMemberId, fetchedNick); // 새 닉네임 추가 또는 업데이트
        return newMap; // 새로운 Map을 반환하여 상태 업데이트 트리거
      });
      console.log(`Fetched and stored nick for memberId ${targetMemberId}: ${fetchedNick}`);
    } else {
      // API 호출은 성공했지만 (result.success가 true), 데이터가 없거나 에러 메시지가 있는 경우
      // 또는 api.authenticatedRequest 자체에서 인증 실패 등으로 success가 false인 경우
      console.warn(`Failed to fetch nick for memberId ${targetMemberId}:`, result.message || 'Unknown error or no member info found');
    }
  } catch (error) {
    console.error(`Network error while fetching nick for memberId ${targetMemberId}:`, error);
  }
}, [memberInfoMap, memberId]);

  // --- 실시간 메시지 추가 함수 ---
  // HomePage로부터 STOMP로 수신된 새 메시지를 messages 상태에 추가하는 함수
  const addRealtimeMessage = useCallback((message) => {
    // 메시지 수신 시 Date 객체로 파싱하여 저장
    const parsedMessage = {
      ...message,
      createDateTime: message.createDateTime ? new Date(message.createDateTime) : new Date(),
      createDate: message.createDate ? new Date(message.createDate) : new Date()
    };
    setMessages(prevMessages => [...prevMessages, parsedMessage]);

    // 새로운 메시지의 발신자 닉네임을 확인하고 없으면 로드 요청
    // 현재 로그인된 사용자의 메시지는 이미 memberNick으로 알고 있으므로 제외
    if (parsedMessage.userPid !== memberId && !memberInfoMap.has(parsedMessage.userPid)) {
      fetchAndStoreMemberNick(parsedMessage.userPid);
    }
  }, [memberInfoMap, memberId, fetchAndStoreMemberNick]); // 의존성 추가

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
    // 모달이 화면 밖으로 나가지 않도록 경계 설정
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

  // --- 메시지 로드 함수 (API 호출) ---
  // 백엔드에서 메시지 목록을 조회하는 함수 (초기 로딩 및 무한 스크롤)
  const fetchMessages = useCallback(async (roomId, loadType, count, currentMinCnt = null) => {
    if (!roomId || isLoadingMessages) {
        console.log("fetchMessages: Aborting due to no room ID or already loading.", { roomId, isLoadingMessages });
        return;
    }

    setIsLoadingMessages(true); // 로딩 시작 상태
    const initialScrollHeight = messagesContainerRef.current ? messagesContainerRef.current.scrollHeight : 0; // 스크롤 위치 유지를 위해 초기 높이 저장

    try {
      const requestBody = {
        roomId: roomId,
        count: count,
        type: loadType,
        currentMinCnt: currentMinCnt // NOT_FIRST 타입일 때 이전 메시지 기준점
      };

      console.log("Fetching messages with requestBody:", requestBody);

      const response = await fetch(`${CHAT_API_BASE_URL}/message/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${accessToken}` // 인증 필요시 여기에 토큰 추가
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API Response data: ', data);

      if (response.ok && !data.error) {
        const fetchedMessages = data.messageList || [];
        const parsedMessages = fetchedMessages.map(msg => ({
          ...msg,
          createDateTime: msg.createDateTime ? new Date(msg.createDateTime) : new Date(),
          createDate: msg.createDate ? new Date(msg.createDate) : new Date()
        }));

        if (loadType === MessageLoadType.FIRST) {
          setMessages(parsedMessages); // 초기 로딩 시 메시지 목록을 새로 설정
        } else if (loadType === MessageLoadType.NOT_FIRST) {
          // 이전 메시지 로딩 시 기존 메시지 앞에 추가
          setMessages(prevMessages => [...parsedMessages, ...prevMessages]);

          // 스크롤 위치를 유지하여 사용자가 이전 메시지를 계속 볼 수 있도록 함
          if (messagesContainerRef.current) {
              const newScrollHeight = messagesContainerRef.current.scrollHeight;
              messagesContainerRef.current.scrollTop = newScrollHeight - initialScrollHeight;
          }
        }

        // 더 로드할 메시지가 있는지 여부 판단
        setHasMoreMessages(parsedMessages.length > 0);

        if (parsedMessages.length > 0) {
          // ★★★ 로드된 메시지들의 발신자 닉네임을 한 번에 조회 ★★★
          // 중복 없는 memberId 목록을 추출
          const uniqueMemberIds = [...new Set(parsedMessages.map(msg => msg.userPid))];
          uniqueMemberIds.forEach(id => {
            // 현재 로그인된 사용자가 아니면서 닉네임 Map에 없는 경우에만 조회 요청
            if (id !== memberId && !memberInfoMap.has(id)) { 
              fetchAndStoreMemberNick(id);
            }
          });
          toast.success(`메시지를 ${parsedMessages.length}개 로드했습니다.`);
        } else {
          toast.info('더 이상 메시지가 없습니다.');
        }

      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '메시지 로드 실패: 알 수 없는 오류');
        toast.error(errorMessage || `API 오류: ${response.status}`);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('메시지 로드 중 네트워크 오류 발생:', error);
      toast.error('메시지 로드 중 네트워크 오류가 발생했습니다.');
      setHasMoreMessages(false);
    } finally {
      setIsLoadingMessages(false); // 로딩 종료 상태
    }
  }, [isLoadingMessages, memberId, memberInfoMap, fetchAndStoreMemberNick]); // 의존성 추가

  // --- 메시지 전송 핸들러 ---
  // 입력된 메시지를 STOMP를 통해 서버로 전송하는 함수
  const handleSendMessage = () => {
    if (newMessage.trim() && stompClient && stompClient.connected) {
      const messagePayload = {
        messageContents: newMessage.trim(),
        userPid: memberId, // 발신자 memberId
        roomPid: room.roomId, // 채팅방 ID
      };

      const destination = `/send/`; // 서버의 @MessageMapping("/") 경로에 해당

      try {
        stompClient.send(destination, {}, JSON.stringify(messagePayload));
        setNewMessage(''); // 메시지 전송 후 입력 필드 초기화
        console.log('Message sent:', messagePayload);
        // 메시지 전송 후 낙관적 업데이트는 하지 않습니다.
        // 서버에서 브로드캐스트된 메시지를 HomePage가 수신하여 이 컴포넌트의 addRealtimeMessage를 통해 UI를 업데이트할 것입니다.
        // 이렇게 하면 내가 보낸 메시지도 서버를 경유하여 화면에 표시되므로, 순서와 정확성이 보장됩니다.
      } catch (error) {
        console.error("Failed to send message via STOMP:", error);
        toast.error("메시지 전송에 실패했습니다.");
      }
    } else if (!stompClient || !stompClient.connected) {
      toast.warn("WebSocket 연결이 활성화되지 않았습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  // --- 엔터 키 입력 시 메시지 전송 핸들러 ---
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Shift+Enter는 줄바꿈, Enter만 전송
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- 날짜 구분선과 함께 메시지 렌더링 로직 ---
  const renderMessagesWithDateDividers = () => {
    let lastDate = null; // 이전 메시지의 날짜를 추적하여 날짜 변경 시 구분선 추가
    const elements = [];

    // 메시지를 msgRoomCnt 기준으로 오름차순으로 정렬합니다. (가장 오래된 메시지가 위에 오도록)
    const sortedMessages = [...messages].sort((a, b) => {
        if (a.msgRoomCnt === undefined || b.msgRoomCnt === undefined) {
            return 0; // msgRoomCnt가 없으면 정렬하지 않음
        }
        return a.msgRoomCnt - b.msgRoomCnt;
    });

    sortedMessages.forEach((msg) => {
      const messageDate = msg.createDate instanceof Date && !isNaN(msg.createDate.getTime())
                            ? msg.createDate.toDateString() // 날짜를 문자열로 변환 (예: "Thu Jun 13 2025")
                            : null;

      // 이전 메시지와 날짜가 다르면 날짜 구분선 추가
      if (messageDate && messageDate !== lastDate) {
        elements.push(
          <div key={`date-divider-${messageDate}`} className="chat-date-divider">
            {msg.createDate instanceof Date && !isNaN(msg.createDate.getTime())
                ? msg.createDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
                : '날짜 오류'}
          </div>
        );
        lastDate = messageDate; // 현재 메시지의 날짜로 lastDate 업데이트
      }

      // ★★★ 닉네임 조회 로직 ★★★
      // 현재 로그인된 사용자의 메시지인 경우, props로 받은 memberNick을 사용합니다.
      // 그 외의 경우, memberInfoMap에서 닉네임을 찾고, 없으면 '알 수 없음'으로 기본값을 설정합니다.
      const senderNickToDisplay = (msg.userPid === memberId) ? memberNick : (memberInfoMap.get(msg.userPid) || '알 수 없음');
      
      // 만약 메시지의 발신자 닉네임이 Map에 없고, 본인의 메시지가 아니라면 비동기로 닉네임 조회를 요청합니다.
      // 이 로직은 '알 수 없음'으로 표시된 닉네임을 나중에 실제 닉네임으로 업데이트하는 역할을 합니다.
      if (msg.userPid !== memberId && !memberInfoMap.has(msg.userPid)) {
        fetchAndStoreMemberNick(msg.userPid);
      }

      elements.push(
        <div
          key={msg.id || `${msg.userPid}-${msg.createDateTime?.getTime() || Date.now()}`} // 메시지 고유 키
          className={`chat-message ${msg.userPid == memberId ? 'my-message' : 'other-message'}`}
        >
          {msg.userPid != memberId && ( // 상대방 메시지인 경우 (좌측)
            <div className="message-bubble-wrapper">
              <span className="message-sender">{senderNickToDisplay}</span> {/* 닉네임 표시 */}
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
          {msg.userPid == memberId && ( // 내 메시지인 경우 (우측)
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

  // --- 스크롤 이벤트 핸들러 (무한 스크롤) ---
  // ★★★ `handleScroll` 함수를 `useEffect`보다 위에 선언하여 초기화 오류를 방지했습니다. ★★★
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;

      // 스크롤이 맨 위(scrollTop === 0)에 도달했고, 로딩 중이 아니며, 더 로드할 메시지가 있고, 현재 메시지가 있을 때
      if (scrollTop === 0 && !isLoadingMessages && hasMoreMessages && messages.length > 0) {
        const oldestMsgRoomCnt = messages[0].msgRoomCnt; // 가장 오래된 메시지의 msgRoomCnt를 기준으로 삼음

        if (oldestMsgRoomCnt !== undefined && oldestMsgRoomCnt > 1) { // msgRoomCnt가 1인 경우는 가장 첫 메시지이므로 더 이상 이전 메시지가 없음
          fetchMessages(room.roomId, MessageLoadType.NOT_FIRST, 20, oldestMsgRoomCnt); // 이전 메시지 20개 로드
        } else {
          setHasMoreMessages(false); // 더 이상 이전 메시지가 없음
          toast.info('더 이상 이전 메시지가 없습니다.');
        }
      }
    }
  }, [isLoadingMessages, hasMoreMessages, messages, room?.roomId, fetchMessages]);

  // --- useEffect 훅들 ---

  // 1. 모달 드래그 이벤트 리스너 등록/해제
  // 모달이 열리면 마우스 이벤트 리스너를 등록하고, 닫히면 해제합니다.
  useEffect(() => {
    if (isOpen) {
      if (modalRef.current) {
        // 모달이 열릴 때 중앙에 위치하도록 초기 위치 설정
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
      isDragging.current = false; // 드래그 중인 상태 초기화
    }
    // 클린업 함수: 컴포넌트 언마운트 또는 isOpen 변경 시 이벤트 리스너 해제
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, handleMouseMove, handleMouseUp]);

  // 2. localStorage에 memberInfoMap 동기화
  // memberInfoMap 상태가 변경될 때마다 localStorage에 업데이트된 닉네임 목록을 저장합니다.
  useEffect(() => {
    try {
      localStorage.setItem('memberInfoList', JSON.stringify(Array.from(memberInfoMap.entries()).map(([memberId, nick]) => ({ memberId, nick }))));
    } catch (e) {
      console.error("Failed to save memberInfoList to localStorage:", e);
    }
  }, [memberInfoMap]);

  // 3. 모달 열릴 때 초기 메시지 로드 (한 번만 수행)
  // 모달이 열리고 방 정보가 유효하며, 이전에 한 번도 열리지 않았을 때 초기 메시지를 로드합니다.
  useEffect(() => {
    if (isOpen && room?.roomId && !hasOpenedOnceRef.current) {
      setMessages([]); // 메시지 목록 초기화
      setHasMoreMessages(true); // 더 로드할 메시지가 있다고 가정

      fetchMessages(room.roomId, MessageLoadType.FIRST, 20); // 초기 메시지 20개 로드

      hasOpenedOnceRef.current = true; // 플래그 설정: 한 번 열렸음을 기록
    } else if (!isOpen) {
        hasOpenedOnceRef.current = false; // 모달이 닫히면 플래그 초기화 (다시 열면 새로 로드)
        setMessages([]); // 모달 닫을 때 메시지 목록 초기화
    }
    return () => { };
  }, [isOpen, room, fetchMessages]);

  // 4. HomePage로부터 받은 chatModalAddMessageRef에 addRealtimeMessage 함수 등록
  // HomePage에서 STOMP 메시지를 받아 처리할 수 있도록 addRealtimeMessage 함수를 Ref에 연결합니다.
  useEffect(() => {
    if (isOpen && chatModalAddMessageRef) {
      chatModalAddMessageRef.current = addRealtimeMessage; // ref에 addRealtimeMessage 함수 등록
      console.log("ChatRoomModal: addRealtimeMessage connected to HomePage's ref.");
    } else if (chatModalAddMessageRef) {
      chatModalAddMessageRef.current = null; // 모달 닫힐 때 ref 해제
      console.log("ChatRoomModal: addRealtimeMessage disconnected from HomePage's ref.");
    }
    return () => {
        if (chatModalAddMessageRef.current) {
            chatModalAddMessageRef.current = null; // 클린업 시에도 확실히 해제
        }
    };
  }, [isOpen, chatModalAddMessageRef, addRealtimeMessage]); 

  // 5. 메시지 스크롤 하단 고정
  // 메시지 목록이 업데이트될 때마다 자동으로 가장 최신 메시지가 보이도록 스크롤합니다.
  useEffect(() => {
    if (isOpen && !isLoadingMessages) { // 메시지가 로딩 중일 때는 자동 스크롤하지 않음
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoadingMessages]);

  // 6. 무한 스크롤 이벤트 리스너 등록/해제
  // 메시지 컨테이너의 스크롤 이벤트를 감지하여 스크롤이 맨 위에 도달하면 이전 메시지를 로드합니다.
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll); // 이제 handleScroll이 선언된 후이므로 접근 가능
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]); // handleScroll 함수가 변경될 때마다 리스너 갱신

  // --- 렌더링 조건부 반환 ---
  // 모달이 열려있지 않거나 방 정보가 없으면 아무것도 렌더링하지 않음
  if (!isOpen || !room) {
    return null;
  }

  // --- 모달 UI 렌더링 ---
  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}> {/* 모달 오버레이 */}
      <div
        ref={modalRef} // 드래그를 위한 Ref
        className="chat-modal-container"
        style={modalPosition} // 동적으로 변경되는 모달 위치
      >
        {/* 채팅 헤더 (방 제목, 닫기 버튼) */}
        <div className="chat-header" onMouseDown={handleMouseDown}> {/* 드래그 시작 이벤트 */}
          <div className="header-left">
            <h3 className="header-chat-title">{room.roomTitle}</h3>
          </div>
          <div className="header-right">
            <button onClick={onClose} className="header-icon-button">
              {/* 닫기 아이콘 SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L12 10.5858L16.2929 6.29289C16.6834 5.90237 17.3166 5.90237 17.7071 6.29289C18.0976 6.68342 18.0976 7.31658 17.7071 7.70711L13.4142 12L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L12 13.4142L7.70711 17.7071C7.31658 18.0976 6.68342 18.0976 6.29289 6.29289Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 모달 본문 (메시지 목록 컨테이너) */}
        <div className="modal-body">
          <div className="chat-messages-container" ref={messagesContainerRef}> {/* 스크롤 감지용 Ref */}
            {isLoadingMessages && ( // 메시지 로딩 중 표시
              <div style={{ textAlign: 'center', padding: '10px', color: '#666', fontSize: '0.9em' }}>
                <span className="loading-spinner"></span> 이전 메시지 로딩 중...
              </div>
            )}
            {!isLoadingMessages && !hasMoreMessages && messages.length > 0 && ( // 더 이상 이전 메시지가 없을 때 표시
              <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '0.8em' }}>
                더 이상 이전 메시지가 없습니다.
              </div>
            )}
            {renderMessagesWithDateDividers()} {/* 날짜 구분선과 함께 메시지 렌더링 */}
            <div ref={messagesEndRef} /> {/* 메시지 목록 하단 스크롤용 Ref */}
          </div>
        </div>

        {/* 채팅 입력 푸터 (메시지 입력 필드 및 전송 버튼) */}
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
              disabled={!newMessage.trim()} // 메시지 내용이 없으면 버튼 비활성화
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