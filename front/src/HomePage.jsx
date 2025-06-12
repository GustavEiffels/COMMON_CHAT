// src/HomePage.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
// API 및 컴포넌트 임포트
import api from './api';
import DashboardHeader from './components/DashboardHeader';
import DashboardNav from './components/DashboardNav'; // 오타 수정: DashboardNav
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
  const [memberId, setMemberId] = useState('');
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

  // --- useEffects to keep refs updated ---
  useEffect(() => {
    isChatModalOpenRef.current = isChatModalOpen;
  }, [isChatModalOpen]);

  useEffect(() => {
    currentChatRoomRef.current = currentChatRoom;
  }, [currentChatRoom]);

  // ★★★ loadInitialData 함수를 원래대로 복구합니다. ★★★
  const loadInitialData = useCallback(() => { // useCallback 유지 (navigate 때문)
    const storedNick = localStorage.getItem('memberNick');
    const storedId = localStorage.getItem('memberId');
    // const storedJwtToken = localStorage.getItem('jwtToken'); // ★★★ 이 줄 제거 ★★★

    const storedPrivateRooms = JSON.parse(localStorage.getItem('privateRooms') || '[]');
    const storedMultiRooms = JSON.parse(localStorage.getItem('multiRooms') || '[]');
    const storedFollowList = JSON.parse(localStorage.getItem('followList') || '[]');
    const storedBlockList = JSON.parse(localStorage.getItem('blockList') || '[]');
    const storedMemberInfoList = JSON.parse(localStorage.getItem('memberInfoList') || '[]');

    // ★★★ jwtToken 확인 조건 제거 ★★★
    if (storedNick && storedId) { // 원래 조건으로 복구
      setMemberNick(storedNick);
      setMemberId(storedId);
      setPrivateRooms(storedPrivateRooms);
      setMultiRooms(storedMultiRooms);
      setFollowList(storedFollowList);
      setBlockList(storedBlockList);
      setMemberInfoList(storedMemberInfoList);
    } else {
      // toast.error('로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.'); // ★★★ 이 줄 제거 ★★★
      navigate('/login'); // 원래대로 리디렉션만 남김
    }
  }, [navigate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // WebSocket 연결 함수 (STOMP 구독 로직 포함)
  const connectWebSocket = useCallback(() => {
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

      if (stompClient.current.subscriptions) {
        Object.keys(stompClient.current.subscriptions).forEach(subId => {
          stompClient.current.unsubscribe(subId);
        });
        console.log("Cleared all previous STOMP subscriptions.");
      }

      const userQueuePath = `/user/queue/messages`;
      stompClient.current.subscribe(userQueuePath, (message) => {
          console.log(`Received private message for user ${memberId}:`, message.body);
          toast.info(`개인 알림: ${message.body}`);
      }, { id: `sub-user-${memberId}` });
      console.log(`Subscribed to user queue: ${userQueuePath}`);

      privateRooms.forEach(room => {
        const subscribePath = `/receive/room/${room.roomId}`;
        stompClient.current.subscribe(subscribePath, (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log(`Received private room message for room ${room.roomId}:`, receivedMessage);
          
          const parsedMessage = {
              ...receivedMessage,
              createDateTime: receivedMessage.createDateTime ? new Date(receivedMessage.createDateTime) : new Date(),
              createDate: receivedMessage.createDate ? new Date(receivedMessage.createDate) : new Date()
          };

          console.log('currentChatRoomRef.current.roomId : '+currentChatRoomRef.current.roomId)

          if (isChatModalOpenRef.current && currentChatRoomRef.current && currentChatRoomRef.current.roomId == room.roomId) {
              if (chatModalAddMessageRef.current) {
                console.log('개인톡에서 현재 열린 모달로 메시지 전달:', parsedMessage.messageContents);
                chatModalAddMessageRef.current(parsedMessage);
              }
          } else {
              toast.info(`1:1 채팅방(${room.roomTitle || room.roomId}) 새 메시지: ${parsedMessage.messageContents}`);
          }
        }, { id: `sub-private-${room.roomId}` });
        console.log(`Subscribed to private room: ${subscribePath}`);
      });

      multiRooms.forEach(room => {
        const subscribePath = `/receive/room/${room.roomId}`;
        stompClient.current.subscribe(subscribePath, (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log(`Received multi room message for room ${room.roomId}:`, receivedMessage);

          const parsedMessage = {
              ...receivedMessage,
              createDateTime: receivedMessage.createDateTime ? new Date(receivedMessage.createDateTime) : new Date(),
              createDate: receivedMessage.createDate ? new Date(receivedMessage.createDate) : new Date()
          };          

          if (isChatModalOpenRef.current && currentChatRoomRef.current && currentChatRoomRef.current.roomId === room.roomId) {
              if (chatModalAddMessageRef.current) {
                console.log('단체톡에서 현재 열린 모달로 메시지 전달:', parsedMessage.messageContents);
                chatModalAddMessageRef.current(parsedMessage);
              }
          } else {
              toast.info(`단체 채팅방(${room.roomTitle || room.roomId}) 새 메시지: ${parsedMessage.messageContents}`);
          }
        }, { id: `sub-multi-${room.roomId}` });
        console.log(`Subscribed to multi room: ${subscribePath}`);
      });


    }, (error) => {
      setIsConnected(false);
      toast.error('WebSocket (STOMP) 연결 오류 발생!');
      console.error('STOMP Connection Error:', error);
    });
  }, [memberId, privateRooms, multiRooms]);

  useEffect(() => {
    console.log("WebSocket useEffect triggered. memberId:", memberId, "isConnected:", isConnected);

    if (memberId && !stompClient.current) {
        console.log("Attempting to connect WebSocket as memberId is available and stompClient is null.");
        connectWebSocket();
    }

    return () => {
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
        setFollowList(prev => { if (prev.some(rel => rel.memberId === newRelation.memberId)) { return prev; } const updatedList = [...prev, newRelation]; localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
        setMemberInfoList(prev => { if (prev.some(info => info.memberId === newMemberInfo.memberId)) { return prev; } const updatedList = [...prev, newMemberInfo]; localStorage.setItem('memberInfoList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 친구 추가에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '친구 추가 중 네트워크 오류가 발생했습니다.'); } finally { handleModalClose(); }
  };

  const handleBlockMember = async (member) => {
    try {
      const response = await api.blockMember(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단했습니다!`);
        const newRelation = response.data.relationShipDto; const newMemberInfo = response.data.memberInfoDto;
        setBlockList(prev => { if (prev.some(rel => rel.memberId === newRelation.memberId)) { return prev; } const updatedList = [...prev, newRelation]; localStorage.setItem('blockList', JSON.stringify(updatedList)); return updatedList; });
        setMemberInfoList(prev => { if (prev.some(info => info.memberId === newMemberInfo.memberId)) { return prev; } const updatedList = [...prev, newMemberInfo]; localStorage.setItem('memberInfoList', JSON.stringify(updatedList)); return updatedList; });
        setFollowList(prev => { const updatedList = prev.filter(rel => rel.memberId !== newRelation.memberId); localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
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
        setFollowList(prev => { const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId); localStorage.setItem('followList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 친구 관계 해제에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '친구 관계 해제 중 네트워크 오류가 발생했습니다.'); } finally { handleRelationModalClose(); }
  };

  const handleUnblock = async (relation, member) => {
    try {
      const response = await api.unblock(relation.relationshipId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단 해제했습니다!`);
        setBlockList(prev => { const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId); localStorage.setItem('blockList', JSON.stringify(updatedList)); return updatedList; });
      } else { toast.error(response.message || `${member.nick}님 차단 해제에 실패했습니다.`); }
    } catch (error) { toast.error(error.message || '차단 해제 중 네트워크 오류가 발생했습니다.'); } finally { handleRelationModalClose(); }
  };

  const handleStartPrivateChat = async (memberToChat) => {
    try {
      const memberIds = [memberToChat.memberId];
      const response = await api.createChatRoom(memberIds, 'PRIVATE', '');

      if (response.success && response.data?.roomId) {
        const newRoom = {
          roomId: response.data.roomId,
          roomTitle: response.data.roomTitle,
          roomType: response.data.roomType,
        };

        const roomExists = privateRooms.some(room => room.roomId === newRoom.roomId);

        if (roomExists) {
          toast.info(`${memberToChat.nick}님과의 채팅방이 이미 존재합니다. 해당 채팅방을 엽니다.`);
          setCurrentChatRoom(privateRooms.find(room => room.roomId === newRoom.roomId));
        } else {
          toast.success(`${memberToChat.nick}님과의 채팅방이 생성되었습니다!`);
          const updatedRooms = [...privateRooms, newRoom];
          setPrivateRooms(updatedRooms);
          localStorage.setItem('privateRooms', JSON.stringify(updatedRooms));
          setCurrentChatRoom(newRoom);
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

  const handleCreateGroupChat = async (selectedFriendIds, roomTitle) => {
    if (selectedFriendIds.length === 0) { toast.warn('채팅에 참여할 친구를 1명 이상 선택해주세요.'); return; }
    try {
      const response = await api.createChatRoom(selectedFriendIds, 'MULTI', roomTitle.trim());
      if (response.success && response.data?.roomId) {
        const newRoom = { roomId: response.data.roomId, roomTitle: response.data.roomTitle, roomType: response.data.roomType, };
        setMultiRooms(prevRooms => { const updatedRooms = [...prevRooms, newRoom]; localStorage.setItem('multiRooms', JSON.stringify(updatedRooms)); return updatedRooms; });
        toast.success(`'${newRoom.roomTitle}' 단체 채팅방이 생성되었습니다!`);
        handleCloseCreateGroupChatModal();
        setCurrentChatRoom(newRoom);
        setIsChatModalOpen(true);
      } else { toast.error(response.message || '단체 채팅방 생성에 실패했습니다.'); }
    } catch (error) { toast.error(error.message || '단체 채팅방 생성 중 네트워크 오류가 발생했습니다.'); }
  };

  // ★★★ return 문 바로 위에 있는 로그인 정보 확인 조건을 원래대로 복구합니다. ★★★
  // 즉, memberNick과 memberId만으로 초기 로딩을 판단합니다.
  if (!memberNick || !memberId) { // jwtToken 확인 조건 제거
    return (<div className="auth-container home-page"><p>사용자 정보를 불러오는 중...</p></div>);
  }

  const friendDetails = followList.map(relation => memberInfoList.find(info => info.memberId === relation.memberId)).filter(Boolean);

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
        chatModalAddMessageRef={chatModalAddMessageRef} // HomePage가 ChatRoomModal로 메시지를 전달하기 위한 ref
      />

      <CreateGroupChatModal isOpen={isCreateGroupChatModalOpen} onClose={handleCloseCreateGroupChatModal} onCreate={handleCreateGroupChat} friends={friendDetails} />
    </div>
  );
}

export default HomePage;