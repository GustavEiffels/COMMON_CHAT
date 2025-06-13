import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
// API 및 컴포넌트 임포트
import api from './api';
import DashboardHeader from './components/DashboardHeader';
import DashboardNav from './components/DashboardNav';
import ChatRoomList from './components/ChatRoomList';
import RelationList from './components/RelationList';
import SearchSection from './components/SearchSection';
import MemberActionModal from './components/modals/MemberActionModal';
import RelationActionModal from './components/modals/RelationActionModal';
import CreateGroupChatModal from './components/modals/CreateGroupChatModal';
import ChatRoomModal from './components/modals/ChatRoomModal';

function HomePage() {
  const navigate = useNavigate();
  // --- useState declarations (keep these at the top of the component body) ---
  const [memberNick, setMemberNick] = useState('');
  const [memberId, setMemberId] = useState(''); // memberId는 string일 가능성이 있으므로 일관된 타입 유지가 중요
  const [activeTab, setActiveTab] = useState('private');
  const [privateRooms, setPrivateRooms] = useState([]);
  const [multiRooms, setMultiRooms] = useState([]);
  const [followList, setFollowList] = useState([]);
  const [blockList, setBlockList] = useState([]);
  const [memberInfoList, setMemberInfoList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [selectedRelationForModal, setSelectedRelationForModal] = useState(null);
  const tabRefs = useRef({});
  const indicatorRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState(null);
  const [isCreateGroupChatModalOpen, setIsCreateGroupChatModalOpen] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null);

  // --- useRef declarations that depend on useState ---
  const chatModalAddMessageRef = useRef(null);
  const isChatModalOpenRef = useRef(isChatModalOpen);
  const currentChatRoomRef = useRef(currentChatRoom);
  // memberIdRef 추가 (WebSocket 연결 시점에 최신 memberId를 사용하기 위함)
  const memberIdRef = useRef(memberId); 
  // privateRoomsRef, multiRoomsRef는 이제 필요 없음. 대신 상태값을 직접 사용.

  // --- useEffects to keep refs updated ---
  useEffect(() => {
    isChatModalOpenRef.current = isChatModalOpen;
  }, [isChatModalOpen]);

  useEffect(() => {
    currentChatRoomRef.current = currentChatRoom;
  }, [currentChatRoom]);

  // memberId 변경 시 ref 업데이트
  useEffect(() => {
    memberIdRef.current = memberId;
  }, [memberId]);

  const loadInitialData = useCallback(() => {
    const storedNick = localStorage.getItem('memberNick');
    const storedId = localStorage.getItem('memberId');
    
    setMemberId(storedId ? String(storedId) : ''); 
    
    const storedPrivateRooms = JSON.parse(localStorage.getItem('privateRooms') || '[]');
    const storedMultiRooms = JSON.parse(localStorage.getItem('multiRooms') || '[]');
    const storedFollowList = JSON.parse(localStorage.getItem('followList') || '[]');
    const storedBlockList = JSON.parse(localStorage.getItem('blockList') || '[]');
    const storedMemberInfoList = JSON.parse(localStorage.getItem('memberInfoList') || '[]');

    if (storedNick && storedId) {
      setMemberNick(storedNick);
      setPrivateRooms(storedPrivateRooms);
      setMultiRooms(storedMultiRooms);
      setFollowList(storedFollowList);
      setBlockList(storedBlockList);
      setMemberInfoList(storedMemberInfoList);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ★ 변경: WebSocket 연결 함수 (STOMP 구독 로직 포함) - 초기 연결 및 사용자/초대 큐 구독만 담당
  const connectWebSocket = useCallback(() => {
    const currentMemberId = memberIdRef.current;
    if (!currentMemberId) {
        console.warn("Member ID not available yet for WebSocket connection.");
        return;
    }

    if (stompClient.current && stompClient.current.connected) {
      toast.info('WebSocket이 이미 연결되어 있습니다.');
      return;
    }

    const socket = new SockJS(`http://localhost:8888/chat`);
    stompClient.current = Stomp.over(socket);

    stompClient.current.connect({}, (frame) => {
      setIsConnected(true);
      toast.success('WebSocket (STOMP) 연결 성공!');
      console.log('STOMP Connected:', frame);

      // ★★★ 초대 메시지 구독 ★★★
      const invitePath = `/invite/to/${currentMemberId}`; // /invite/to/{toMemberId}
      stompClient.current.subscribe(invitePath, (message) => {
          const invitation = JSON.parse(message.body);
          console.log(`Received invitation for member ${currentMemberId}:`, invitation);
          toast.info(`${invitation.roomTitle || '새 채팅방'}으로 초대되었습니다!`);

          // 초대받은 채팅방 정보 구성
          const invitedRoom = {
              roomId: invitation.roomPid, // roomPid가 백엔드에서 roomId로 넘어옴
              roomTitle: invitation.roomTitle,
              roomType: invitation.roomType || 'MULTI', // 백엔드 초대 DTO에 roomType이 없다면 기본값 설정 필요
          };

          // 해당 채팅방이 private인지 multi인지 구분하여 상태 업데이트
          // (백엔드 초대 DTO에 roomType 정보가 포함되어야 정확히 분류 가능)
          if (invitedRoom.roomType === 'PRIVATE') {
              setPrivateRooms(prevRooms => {
                  const updatedRooms = [...prevRooms];
                  if (!prevRooms.some(room => String(room.roomId) === String(invitedRoom.roomId))) {
                      updatedRooms.push(invitedRoom);
                      localStorage.setItem('privateRooms', JSON.stringify(updatedRooms));
                  }
                  return updatedRooms;
              });
          } else if (invitedRoom.roomType === 'MULTI') {
              setMultiRooms(prevRooms => {
                  const updatedRooms = [...prevRooms];
                  if (!prevRooms.some(room => String(room.roomId) === String(invitedRoom.roomId))) {
                      updatedRooms.push(invitedRoom);
                      localStorage.setItem('multiRooms', JSON.stringify(updatedRooms));
                  }
                  return updatedRooms;
              });
          } else {
              setMultiRooms(prevRooms => {
                  const updatedRooms = [...prevRooms];
                  if (!prevRooms.some(room => String(room.roomId) === String(invitedRoom.roomId))) {
                      updatedRooms.push({ ...invitedRoom, roomType: 'MULTI' }); // 기본값으로 MULTI 설정
                      localStorage.setItem('multiRooms', JSON.stringify(updatedRooms));
                  }
                  return updatedRooms;
              });
              console.warn("Received invitation without a valid roomType, defaulting to MULTI.");
          }

          // ★ 변경: 초대받은 채팅방 구독은 아래의 별도 useEffect가 담당합니다. 여기서는 상태만 업데이트.
      }, { id: `sub-invite-${currentMemberId}` });
      console.log(`Subscribed to invite queue: ${invitePath}`);

      const userQueuePath = `/user/queue/messages`;
      stompClient.current.subscribe(userQueuePath, (message) => {
          console.log(`Received private message for user ${currentMemberId}:`, message.body);
          toast.info(`개인 알림: ${message.body}`);
      }, { id: `sub-user-${currentMemberId}` });
      console.log(`Subscribed to user queue: ${userQueuePath}`);

    }, (error) => {
      setIsConnected(false);
      toast.error('WebSocket (STOMP) 연결 오류 발생!');
      console.error('STOMP Connection Error:', error);
    });
  }, []); // memberId 대신 memberIdRef.current를 사용하므로 종속성 제거 가능 (useCallback 내부에서 ref 사용)

  // ★ 새로 추가: privateRooms 또는 multiRooms 상태가 변경될 때마다 채팅방 구독을 관리하는 useEffect
  useEffect(() => {
    // stompClient가 연결되어 있지 않거나 memberId가 없으면 아무것도 하지 않음
    if (!stompClient.current || !stompClient.current.connected || !memberId) {
      return;
    }

    // 현재 활성화된 구독 ID를 추적하기 위한 Set
    const currentActiveSubscriptions = new Set();

    // 개별 방 구독을 위한 헬퍼 함수
    const subscribeToRoom = (room, type) => {
      const subscribePath = `/receive/room/${room.roomId}`;
      const subscriptionId = `sub-${type}-${room.roomId}`;

      // ★ 수정: stompClient.current.subscriptions가 존재하는지 먼저 확인
      if (stompClient.current.subscriptions && stompClient.current.subscriptions[subscriptionId]) {
        currentActiveSubscriptions.add(subscriptionId); // 활성 구독으로 표시
        return;
      }

      // 구독 설정
      stompClient.current.subscribe(subscribePath, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log(`Received ${type} room message for room ${room.roomId}:`, receivedMessage);
        
        const parsedMessage = {
            ...receivedMessage,
            createDateTime: receivedMessage.createDateTime ? new Date(receivedMessage.createDateTime) : new Date(),
            createDate: receivedMessage.createDate ? new Date(receivedMessage.createDate) : new Date()
        };

        // 현재 ChatRoomModal이 열려 있고, 메시지가 현재 보고 있는 방의 것인지 확인
        if (isChatModalOpenRef.current && currentChatRoomRef.current && String(currentChatRoomRef.current.roomId) === String(room.roomId)) {
            if (chatModalAddMessageRef.current) {
              console.log(`Open modal received message for ${type} room ${room.roomId}:`, parsedMessage.messageContents);
              chatModalAddMessageRef.current(parsedMessage);
            }
        } else {
            // 모달이 닫혀 있거나 다른 방을 보고 있을 때 토스트 알림
            toast.info(`${room.roomTitle || room.roomId} (새 메시지): ${parsedMessage.messageContents}`);
        }
      }, { id: subscriptionId });
      console.log(`Subscribed to ${type} room: ${subscribePath} with ID: ${subscriptionId}`);
      currentActiveSubscriptions.add(subscriptionId);
    };

    // 모든 privateRooms 구독
    privateRooms.forEach(room => subscribeToRoom(room, 'private'));

    // 모든 multiRooms 구독
    multiRooms.forEach(room => subscribeToRoom(room, 'multi'));

    // ★ 수정: 더 이상 목록에 없는 방의 구독 해지 (메모리 누수 방지)
    // stompClient.current.subscriptions가 존재하는지 먼저 확인
    if (stompClient.current.subscriptions) {
      for (const subId in stompClient.current.subscriptions) {
        // 'sub-private-' 또는 'sub-multi-'로 시작하는 구독 ID만 대상으로 함
        if ((subId.startsWith('sub-private-') || subId.startsWith('sub-multi-')) && !currentActiveSubscriptions.has(subId)) {
          console.log(`Unsubscribing from inactive room: ${subId}`);
          stompClient.current.unsubscribe(subId);
        }
      }
    }

    // 이 useEffect의 cleanup 함수 (컴포넌트 언마운트 시 혹은 의존성 변경 시)
    return () => {
      // 전체 웹소켓 연결 해제는 아래의 다른 useEffect에서 담당합니다.
      // 여기서는 특정 방의 구독을 해제할 필요가 없습니다.
      // (room 목록이 변경되면 위 로직에서 자동으로 해제됩니다.)
    };
  }, [privateRooms, multiRooms, memberId, isConnected]); // privateRooms, multiRooms 상태에 따라 반응

  useEffect(() => {
    console.log("WebSocket useEffect triggered. memberId:", memberId, "isConnected:", isConnected);

    // memberId가 유효하고, 아직 stompClient가 연결되지 않았을 때만 연결 시도
    if (memberId && (!stompClient.current || !stompClient.current.connected)) { // ?.connected로 안전하게 접근
        console.log("Attempting to connect WebSocket as memberId is available and stompClient is not connected.");
        connectWebSocket();
    }

    return () => {
      // 컴포넌트 언마운트 또는 memberId 변경 시 연결 해제
      if (stompClient.current && stompClient.current.connected) {
        stompClient.current.deactivate();
        console.log("STOMP connection deactivated on unmount or memberId change.");
      }
    };
  }, [memberId, connectWebSocket]);


  const disconnectWebSocket = () => {
    if (stompClient.current) {
      if (stompClient.current.connected) {
        if (stompClient.current.subscriptions) {
          Object.keys(stompClient.current.subscriptions).forEach(subId => {
            stompClient.current.unsubscribe(subId);
          });
          console.log("Cleared all STOMP subscriptions before disconnecting.");
        }
        stompClient.current.disconnect(() => {
          setIsConnected(false);
          toast.warn('WebSocket (STOMP) 연결이 종료되었습니다.');
          console.log("STOMP Disconnected gracefully.");
        });
      }
      stompClient.current = null;
    }
  };

  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const handleToggleWebSocketConnection = () => {
    if (isConnected) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  };

  const handleLogout = () => {
    disconnectWebSocket();
    localStorage.clear();
    toast.info('로그아웃 되었습니다.');
    navigate('/login');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) { toast.warn('검색어를 입력해주세요.'); setSearchResults([]); setSearchError(''); return; }
    setSearchLoading(true); setSearchError(''); setSearchResults([]);
    try {
      const response = await api.searchMembers(searchQuery.trim(), 'nick', 0, 10);
      if (response.success) {
        if (response.data && Array.isArray(response.data.members)) {
          const filteredMembers = response.data.members.filter((member) => String(member.memberId) !== String(memberId));
          setSearchResults(filteredMembers);
          if (filteredMembers.length === 0) { toast.info('검색 결과가 없습니다.'); } else { toast.success(`${filteredMembers.length}명의 회원을 찾았습니다.`); }
        } else { setSearchError('유효한 검색 결과 형식이 아닙니다.'); toast.error('검색 결과 처리 중 오류가 발생했습니다.'); }
      } else { setSearchError(response.message || '회원 검색 실패'); toast.error(response.message || '회원 검색에 실패했습니다.'); }
    } catch (error) { setSearchError(error.message || '네트워크 오류 발생'); toast.error(error.message || '회원 검색 중 네트워크 오류가 발생했습니다.'); } finally { setSearchLoading(false); }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') { handleSearch(); } };
  const handleSearchResultClick = (member) => { setSelectedMemberForModal(member); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setTimeout(() => setSelectedMemberForModal(null), 300); };

  const handleAddFriend = async (member) => {
    try {
      const response = await api.addFriend(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 친구로 추가했습니다!`);
        const newRelation = response.data.relationShipDto; const newMemberInfo = response.data.memberInfoDto;
        setFollowList(prev => { if (prev.some(rel => String(rel.memberId) === String(newRelation.memberId))) { return prev; } const updatedList = [...prev, newRelation]; localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
        setMemberInfoList(prev => { if (prev.some(info => String(info.memberId) === String(newMemberInfo.memberId))) { return prev; } const updatedList = [...prev, newMemberInfo]; localStorage.setItem('memberInfoList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 친구 추가에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '친구 추가 중 네트워크 오류가 발생했습니다.'); } finally { handleModalClose(); }
  };

  const handleBlockMember = async (member) => {
    try {
      const response = await api.blockMember(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단했습니다!`);
        const newRelation = response.data.relationShipDto; const newMemberInfo = response.data.memberInfoDto;
        setBlockList(prev => { if (prev.some(rel => String(rel.memberId) === String(newRelation.memberId))) { return prev; } const updatedList = [...prev, newRelation]; localStorage.setItem('blockList', JSON.stringify(updatedList)); return updatedList; });
        setMemberInfoList(prev => { if (prev.some(info => String(info.memberId) === String(newMemberInfo.memberId))) { return prev; } const updatedList = [...prev, newMemberInfo]; localStorage.setItem('memberInfoList', JSON.stringify(updatedList)); return updatedList; });
        setFollowList(prev => { const updatedList = prev.filter(rel => String(rel.memberId) !== String(newRelation.memberId)); localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 차단에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '회원 차단 중 네트워크 오류가 발생했습니다.'); } finally { handleModalClose(); }
  };

  const handleRelationClick = (relation, memberInfo, type) => { setSelectedRelationForModal({ relation, member: memberInfo, type }); setIsRelationModalOpen(true); };
  const handleRelationModalClose = () => { setIsRelationModalOpen(false); setTimeout(() => setSelectedRelationForModal(null), 300); };

  const handleUnfriend = async (relation, member) => {
    try {
      const response = await api.unfollow(relation.relationshipId);
      if (response.success) {
        toast.success(`${member.nick}님과의 친구 관계를 해제했습니다!`);
        setFollowList(prev => { const updatedList = prev.filter(r => String(r.relationshipId) !== String(relation.relationshipId)); localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 친구 관계 해제에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '친구 관계 해제 중 네트워크 오류가 발생했습니다.'); } finally { handleRelationModalClose(); }
  };

  const handleUnblock = async (relation, member) => {
    try {
      const response = await api.unblock(relation.relationshipId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단 해제했습니다!`);
        setBlockList(prev => { const updatedList = prev.filter(r => String(r.relationshipId) !== String(relation.relationshipId)); localStorage.setItem('blockList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 차단 해제에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '차단 해제 중 네트워크 오류가 발생했습니다.'); } finally { handleRelationModalClose(); }
  };

  // 1:1 채팅방 생성 및 초대 로직
  const handleStartPrivateChat = async (memberToChat) => {
    try {
      const memberIds = [memberToChat.memberId, Number(memberId)]; // Number(memberId)로 타입 일관성 유지
      const response = await api.createChatRoom(memberIds, 'PRIVATE', memberToChat.nick); // 1:1은 상대방 닉네임을 방 제목으로

      if (response.success && response.data?.roomId) {
        const newRoom = {
          roomId: response.data.roomId,
          roomTitle: response.data.roomTitle,
          roomType: response.data.roomType,
        };

        const roomExists = privateRooms.some(room => String(room.roomId) === String(newRoom.roomId));

        if (roomExists) {
          toast.info(`${memberToChat.nick}님과의 채팅방이 이미 존재합니다. 해당 채팅방을 엽니다.`);
          setCurrentChatRoom(privateRooms.find(room => String(room.roomId) === String(newRoom.roomId)));
        } else {
          toast.success(`${memberToChat.nick}님과의 채팅방이 생성되었습니다!`);
          const updatedRooms = [...privateRooms, newRoom];
          setPrivateRooms(updatedRooms);
          localStorage.setItem('privateRooms', JSON.stringify(updatedRooms));
          setCurrentChatRoom(newRoom);

          // ★★★ 1:1 채팅방 생성 후 상대방에게 초대 메시지 전송 ★★★
          // memberIds에 현재 로그인한 사용자(memberId)와 초대할 상대방(memberToChat.memberId)이 포함됩니다.
          // 여기서 memberIds는 CreateResponse의 memberIds입니다.
          if (stompClient.current && stompClient.current.connected) {
              const fromMemberId = Number(memberId); // 현재 로그인한 사용자
              const roomPid = Number(response.data.roomId); // 새로 생성된 방 ID

              // 자기 자신을 제외한 다른 멤버에게 초대 메시지 전송
              const invitedMembers = response.data.memberIds.filter(id => String(id) !== String(fromMemberId));
              
              if (invitedMembers.length > 0) {
                  invitedMembers.forEach(toId => {
                      const inviteMessage = {
                          roomPid: roomPid,
                          fromMemberId: fromMemberId,
                          toMemberId: Number(toId),
                          roomTitle: response.data.roomTitle // 초대 시 방 제목도 함께 전달하여 수신자가 어떤 방인지 알 수 있도록 함
                      };
                      // STOMP를 통해 /send/invite 엔드포인트로 메시지 전송
                      console.log("stompClient : invite : "+stompClient)
                      stompClient.current.send("/send/invite", {}, JSON.stringify(inviteMessage));
                      console.log(`초대 메시지 전송: roomPid=${roomPid}, from=${fromMemberId}, to=${toId}`);
                  });
                  toast.success('초대 메시지를 성공적으로 보냈습니다.');
              } else {
                  console.log('초대할 멤버가 없습니다 (자기 자신만 있는 1:1 방).');
              }
          } else {
              toast.warn('웹소켓이 연결되지 않아 초대 메시지를 보낼 수 없습니다.');
          }
        }

        setActiveTab('private');
        setIsChatModalOpen(true);

      } else {
        toast.error(response.message || '채팅방 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '채팅방 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsModalOpen(false);
      setSelectedMemberForModal(null);
      setIsRelationModalOpen(false);
      setSelectedRelationForModal(null);
    }
  };

  const handleStartChatWithFriend = (member) => { handleStartPrivateChat(member); };
  const handleRoomClick = (room) => { setCurrentChatRoom(room); setIsChatModalOpen(true); };
  const handleCloseChatModal = () => { setIsChatModalOpen(false); setTimeout(() => setCurrentChatRoom(null), 300); };

  const handleOpenCreateGroupChatModal = () => {
    if (followList.length === 0) { toast.warn('단체 채팅방을 만들려면 먼저 친구를 추가해야 합니다.'); return; }
    setIsCreateGroupChatModalOpen(true);
  };

  const handleCloseCreateGroupChatModal = () => { setIsCreateGroupChatModalOpen(false); };

  // 단체 채팅방 생성 및 초대 로직
  const handleCreateGroupChat = async (selectedFriendIds, roomTitle) => {
    if (selectedFriendIds.length === 0) { toast.warn('채팅에 참여할 친구를 1명 이상 선택해주세요.'); return; }
    
    // 현재 로그인한 사용자 ID를 포함
    const allMemberIds = [...selectedFriendIds, Number(memberId)]; 

    try {
      const response = await api.createChatRoom(allMemberIds, 'MULTI', roomTitle.trim());
      if (response.success && response.data?.roomId) {
        const newRoom = { roomId: response.data.roomId, roomTitle: response.data.roomTitle, roomType: response.data.roomType, };
        
        setMultiRooms(prevRooms => { 
            const updatedRooms = [...prevRooms, newRoom]; 
            localStorage.setItem('multiRooms', JSON.stringify(updatedRooms)); 
            return updatedRooms; 
        });
        toast.success(`'${newRoom.roomTitle}' 단체 채팅방이 생성되었습니다!`);
        handleCloseCreateGroupChatModal();
        setCurrentChatRoom(newRoom);
        setIsChatModalOpen(true);

        // ★★★ 단체 채팅방 생성 후 멤버들에게 초대 메시지 전송 ★★★
        if (stompClient.current && stompClient.current.connected) {
            const fromMemberId = Number(memberId); // 현재 로그인한 사용자
            const roomPid = Number(response.data.roomId); // 새로 생성된 방 ID

            // 자기 자신을 제외한 나머지 멤버들에게 초대 메시지 전송
            const invitedMembers = response.data.memberIds.filter(id => String(id) !== String(fromMemberId));
            
            if (invitedMembers.length > 0) {
                invitedMembers.forEach(toId => {
                    const inviteMessage = {
                        roomPid: roomPid,
                        fromMemberId: fromMemberId,
                        toMemberId: Number(toId),
                        roomTitle: response.data.roomTitle // 초대 시 방 제목도 함께 전달
                    };
                    // STOMP를 통해 /send/invite 엔드포인트로 메시지 전송
                    stompClient.current.send("/send/invite", {}, JSON.stringify(inviteMessage));
                    console.log(`단체 채팅방 초대 메시지 전송: roomPid=${roomPid}, from=${fromMemberId}, to=${toId}`);
                });
                toast.success('단체 채팅방 초대 메시지를 성공적으로 보냈습니다.');
            } else {
                console.log('초대할 멤버가 없습니다 (방 생성자만 포함된 방).');
            }
        } else {
            toast.warn('웹소켓이 연결되지 않아 초대 메시지를 보낼 수 없습니다.');
        }

      } else { toast.error(response.message || '단체 채팅방 생성에 실패했습니다.'); }
    } catch (error) { toast.error(error.message || '단체 채팅방 생성 중 네트워크 오류가 발생했습니다.'); }
  };

  if (!memberNick || !memberId) {
    return (<div className="auth-container home-page"><p>사용자 정보를 불러오는 중...</p></div>);
  }

  const friendDetails = followList.map(relation => memberInfoList.find(info => String(info.memberId) === String(relation.memberId))).filter(Boolean);

  return (
    <div className="chat-dashboard">
      <DashboardHeader memberNick={memberNick} onLogout={handleLogout} />
      <DashboardNav activeTab={activeTab} setActiveTab={setActiveTab} tabRefs={tabRefs} indicatorRef={indicatorRef} indicatorStyle={indicatorStyle} />
      <div className="dashboard-content">
        {activeTab === 'private' && ( <ChatRoomList title="나의 1:1 채팅방" rooms={privateRooms} type="private" onRoomClick={handleRoomClick} /> )}
        {activeTab === 'multi' && (
          <>
            <div className="list-header">
              <h2 className="list-title">나의 단체 채팅방</h2>
              <button className="create-group-chat-btn" onClick={handleOpenCreateGroupChatModal}>단체 채팅방 만들기</button>
            </div>
            <ChatRoomList rooms={multiRooms} type="multi" onRoomClick={handleRoomClick} />
          </>
        )}
        {activeTab === 'friends' && (
          <>
            <SearchSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleKeyPress={handleKeyPress}
            handleSearch={handleSearch} searchLoading={searchLoading} searchError={searchError} searchResults={searchResults} handleSearchResultClick={handleSearchResultClick} />
            <RelationList title="나의 친구 목록" relations={followList} memberInfos={memberInfoList} relationType="follow" onRelationClick={handleRelationClick} />
          </>
        )}
        {activeTab === 'blocked' && ( <RelationList title="나의 차단 목록" relations={blockList} memberInfos={memberInfoList} relationType="block" onRelationClick={handleRelationClick} /> )}
      </div>
      <MemberActionModal isOpen={isModalOpen} onClose={handleModalClose} member={selectedMemberForModal} onAddFriend={handleAddFriend} onBlockMember={handleBlockMember} onStartPrivateChat={handleStartPrivateChat} />
      <RelationActionModal isOpen={isRelationModalOpen} onClose={handleRelationModalClose} relationInfo={selectedRelationForModal} onUnfriend={handleUnfriend} onUnblock={handleUnblock} onStartChatWithFriend={handleStartChatWithFriend} />

      {/* ChatRoomModal 컴포넌트 렌더링 */}
      <ChatRoomModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        room={currentChatRoom}
        memberId={memberId}
        memberNick={memberNick}
        stompClient={stompClient.current}
        chatModalAddMessageRef={chatModalAddMessageRef} // 이 ref를 Modal에 전달
      />

      <CreateGroupChatModal isOpen={isCreateGroupChatModalOpen} onClose={handleCloseCreateGroupChatModal} onCreate={handleCreateGroupChat} friends={friendDetails} />
    </div>
  );
}

export default HomePage;