// src/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// API 및 컴포넌트 임포트
import api from './api';
import DashboardHeader from './components/DashboardHeader';
import DashboardNav from './components/DashboardNav';
import ChatRoomList from './components/ChatRoomList';
import RelationList from './components/RelationList';
import SearchSection from './components/SearchSection';
import MemberActionModal from './components/modals/MemberActionModal';
import RelationActionModal from './components/modals/RelationActionModal';
import ChatRoomModal from './components/modals/ChatRoomModal';
import CreateGroupChatModal from './components/modals/CreateGroupChatModal';

function HomePage() {
  const navigate = useNavigate();
  // ... (기존의 모든 useState, useRef 선언은 그대로 유지) ...
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


  // ... (다른 함수들은 기존과 동일) ...

  const loadInitialData = () => {
    const storedNick = localStorage.getItem('memberNick');
    const storedId = localStorage.getItem('memberId');
    const storedPrivateRooms = JSON.parse(localStorage.getItem('privateRooms') || '[]');
    const storedMultiRooms = JSON.parse(localStorage.getItem('multiRooms') || '[]');
    const storedFollowList = JSON.parse(localStorage.getItem('followList') || '[]');
    const storedBlockList = JSON.parse(localStorage.getItem('blockList') || '[]');
    const storedMemberInfoList = JSON.parse(localStorage.getItem('memberInfoList') || '[]');

    if (storedNick && storedId) {
      setMemberNick(storedNick);
      setMemberId(storedId);
      setPrivateRooms(storedPrivateRooms);
      setMultiRooms(storedMultiRooms);
      setFollowList(storedFollowList);
      setBlockList(storedBlockList);
      setMemberInfoList(storedMemberInfoList);
    } else {
      navigate('/login');
    }
  };

  useEffect(() => { loadInitialData(); }, [navigate]);
  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSearchLoading(false);
    const activeTabButton = tabRefs.current[activeTab];
    if (activeTabButton && indicatorRef.current) {
      const navRect = indicatorRef.current.parentElement.getBoundingClientRect();
      const buttonRect = activeTabButton.getBoundingClientRect();
      setIndicatorStyle({ left: buttonRect.left - navRect.left, width: buttonRect.width });
    }
  }, [activeTab]);
  useEffect(() => {
    const handleResize = () => {
      const activeTabButton = tabRefs.current[activeTab];
      if (activeTabButton && indicatorRef.current) {
        const navRect = indicatorRef.current.parentElement.getBoundingClientRect();
        const buttonRect = activeTabButton.getBoundingClientRect();
        setIndicatorStyle({ left: buttonRect.left - navRect.left, width: buttonRect.width });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => { window.removeEventListener('resize', handleResize); };
  }, [activeTab]);

  const handleLogout = () => { localStorage.clear(); toast.info('로그아웃 되었습니다.'); navigate('/login'); };
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

  // ★★★ 여기가 수정된 부분입니다 ★★★
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

        // 상태를 업데이트 하기 전에, 현재 상태(privateRooms)를 기준으로 방이 이미 존재하는지 확인합니다.
        const roomExists = privateRooms.some(room => room.roomId === newRoom.roomId);

        if (roomExists) {
          // 이미 방이 존재할 경우
          toast.info(`${memberToChat.nick}님과의 채팅방이 이미 존재합니다. 해당 채팅방을 엽니다.`);
          setCurrentChatRoom(privateRooms.find(room => room.roomId === newRoom.roomId));
        } else {
          // 새로운 방일 경우
          toast.success(`${memberToChat.nick}님과의 채팅방이 생성되었습니다!`);
          const updatedRooms = [...privateRooms, newRoom];
          setPrivateRooms(updatedRooms);
          localStorage.setItem('privateRooms', JSON.stringify(updatedRooms));
          setCurrentChatRoom(newRoom);
        }

        // 공통 로직
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

  if (!memberNick || !memberId) { return (<div className="auth-container home-page"><p>사용자 정보를 불러오는 중...</p></div>); }

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
            <SearchSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleKeyPress={handleKeyPress} handleSearch={handleSearch} searchLoading={searchLoading} searchError={searchError} searchResults={searchResults} handleSearchResultClick={handleSearchResultClick} />
            <RelationList title="나의 친구 목록" relations={followList} memberInfos={memberInfoList} relationType="follow" onRelationClick={handleRelationClick} />
          </>
        )}
        {activeTab === 'blocked' && ( <RelationList title="나의 차단 목록" relations={blockList} memberInfos={memberInfoList} relationType="block" onRelationClick={handleRelationClick} /> )}
      </div>
      <MemberActionModal isOpen={isModalOpen} onClose={handleModalClose} member={selectedMemberForModal} onAddFriend={handleAddFriend} onBlockMember={handleBlockMember} onStartPrivateChat={handleStartPrivateChat} />
      <RelationActionModal isOpen={isRelationModalOpen} onClose={handleRelationModalClose} relationInfo={selectedRelationForModal} onUnfriend={handleUnfriend} onUnblock={handleUnblock} onStartChatWithFriend={handleStartChatWithFriend} />
      <ChatRoomModal isOpen={isChatModalOpen} onClose={handleCloseChatModal} room={currentChatRoom} memberId={memberId} memberNick={memberNick} />
      <CreateGroupChatModal isOpen={isCreateGroupChatModalOpen} onClose={handleCloseCreateGroupChatModal} onCreate={handleCreateGroupChat} friends={friendDetails} />
    </div>
  );
}

export default HomePage;
