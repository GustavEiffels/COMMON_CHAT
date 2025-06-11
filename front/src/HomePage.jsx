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
  const [isModalOpen, setIsModalOpen] = useState(false); // 회원 액션 모달
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false); // 관계 액션 모달
  const [selectedRelationForModal, setSelectedRelationForModal] = useState(null);
  const tabRefs = useRef({});
  const indicatorRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // ★★★ 채팅방 모달 관련 상태 ★★★
  const [isChatModalOpen, setIsChatModalOpen] = useState(false); // 채팅 모달 열림 상태
  const [currentChatRoom, setCurrentChatRoom] = useState(null); // 현재 열린 채팅방 정보
  const [isCreateGroupChatModalOpen, setIsCreateGroupChatModalOpen] = useState(false);


  // ... (기존의 loadInitialData, useEffects 등은 변경 없음) ...

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

  useEffect(() => {
    loadInitialData();
  }, [navigate]);

  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSearchLoading(false);

    const activeTabButton = tabRefs.current[activeTab];
    if (activeTabButton && indicatorRef.current) {
      const navRect = indicatorRef.current.parentElement.getBoundingClientRect();
      const buttonRect = activeTabButton.getBoundingClientRect();

      setIndicatorStyle({
        left: buttonRect.left - navRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => {
      const activeTabButton = tabRefs.current[activeTab];
      if (activeTabButton && indicatorRef.current) {
        const navRect = indicatorRef.current.parentElement.getBoundingClientRect();
        const buttonRect = activeTabButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - navRect.left,
          width: buttonRect.width,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);


  const handleLogout = () => {
    localStorage.clear();
    toast.info('로그아웃 되었습니다.');
    navigate('/login');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warn('검색어를 입력해주세요.');
      setSearchResults([]);
      setSearchError('');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await api.searchMembers(searchQuery.trim(), 'nick', 0, 10);

      if (response.success) {
        if (response.data && Array.isArray(response.data.members)) {
          const filteredMembers = response.data.members.filter(
            (member) => String(member.memberId) !== String(memberId)
          );

          setSearchResults(filteredMembers);
          if (filteredMembers.length === 0) {
            toast.info('검색 결과가 없습니다.');
          } else {
            toast.success(`${filteredMembers.length}명의 회원을 찾았습니다.`);
          }
        } else {
          setSearchError('유효한 검색 결과 형식이 아닙니다.');
          toast.error('검색 결과 처리 중 오류가 발생했습니다.');
        }
      } else {
        setSearchError(response.message || '회원 검색 실패');
        toast.error(response.message || '회원 검색에 실패했습니다.');
      }
    } catch (error) {
      setSearchError(error.message || '네트워크 오류 발생');
      toast.error(error.message || '회원 검색 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearchResultClick = (member) => {
    setSelectedMemberForModal(member);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMemberForModal(null), 300);
  };

  const handleAddFriend = async (member) => {
    try {
      const response = await api.addFriend(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 친구로 추가했습니다!`);

        const newRelation = response.data.relationShipDto;
        const newMemberInfo = response.data.memberInfoDto;

        setFollowList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev;
          }
          const updatedList = [...prev, newRelation];
          localStorage.setItem('followList', JSON.stringify(updatedList));
          return updatedList;
        });

        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev;
          }
          const updatedList = [...prev, newMemberInfo];
          localStorage.setItem('memberInfoList', JSON.stringify(updatedList));
          return updatedList;
        });

      } else {
        toast.error(response.message || `${member.nick}님 친구 추가에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '친구 추가 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleModalClose();
    }
  };

  const handleBlockMember = async (member) => {
    try {
      const response = await api.blockMember(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단했습니다!`);

        const newRelation = response.data.relationShipDto;
        const newMemberInfo = response.data.memberInfoDto;

        setBlockList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev;
          }
          const updatedList = [...prev, newRelation];
          localStorage.setItem('blockList', JSON.stringify(updatedList));
          return updatedList;
        });

        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev;
          }
          const updatedList = [...prev, newMemberInfo];
          localStorage.setItem('memberInfoList', JSON.stringify(updatedList));
          return updatedList;
        });

        setFollowList(prev => {
          const updatedList = prev.filter(rel => rel.memberId !== newRelation.memberId);
          localStorage.setItem('followList', JSON.stringify(updatedList));
          return updatedList;
        });

      } else {
        toast.error(response.message || `${member.nick}님 차단에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '회원 차단 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleModalClose();
    }
  };

  const handleRelationClick = (relation, memberInfo, type) => {
    setSelectedRelationForModal({ relation, member: memberInfo, type });
    setIsRelationModalOpen(true);
  };

  const handleRelationModalClose = () => {
    setIsRelationModalOpen(false);
    setTimeout(() => setSelectedRelationForModal(null), 300);
  };

  const handleUnfriend = async (relation, member) => {
    try {
      const response = await api.unfollow(relation.relationshipId);
      if (response.success) {
        toast.success(`${member.nick}님과의 친구 관계를 해제했습니다!`);
        setFollowList(prev => {
          const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId);
          localStorage.setItem('followList', JSON.stringify(updatedList));
          return updatedList;
        });
      } else {
        toast.error(response.message || `${member.nick}님 친구 관계 해제에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '친구 관계 해제 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleRelationModalClose();
    }
  };

  const handleUnblock = async (relation, member) => {
    try {
      const response = await api.unblock(relation.relationshipId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단 해제했습니다!`);
        setBlockList(prev => {
          const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId);
          localStorage.setItem('blockList', JSON.stringify(updatedList));
          return updatedList;
        });

      } else {
        toast.error(response.message || `${member.nick}님 차단 해제에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '차단 해제 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleRelationModalClose();
    }
  };

  // ★★★ 채팅방 생성 후 모달 열기 로직 변경 ★★★
  const handleStartPrivateChat = async (memberToChat) => {
    try {
      const memberIds = [memberToChat.memberId];
      const response = await api.createChatRoom(memberIds, 'PRIVATE','');

      if (response.success && response.data?.roomId) {
        const newRoomId = response.data.roomId;
        const newRoomTitle = response.data.roomTitle;
        const newRoomType = response.data.roomType;

        const newRoom = { roomId: newRoomId, roomTitle: newRoomTitle, roomType: newRoomType };

        setPrivateRooms(prevRooms => {
          if (prevRooms.some(room => room.roomId === newRoom.roomId)) {
            toast.info(`${memberToChat.nick}님과의 채팅방이 이미 존재합니다. 해당 채팅방을 엽니다.`);
            setCurrentChatRoom(prevRooms.find(room => room.roomId === newRoom.roomId)); // 기존 방 설정
          } else {
            toast.success(`${memberToChat.nick}님과의 채팅방이 생성되었습니다!`);
            const updatedRooms = [...prevRooms, newRoom];
            localStorage.setItem('privateRooms', JSON.stringify(updatedRooms));
            setCurrentChatRoom(newRoom); // 새 방 설정
          }
          return prevRooms.some(room => room.roomId === newRoom.roomId) ? prevRooms : [...prevRooms, newRoom]; // 중복 방지하여 추가
        });

        setActiveTab('private');
        setIsChatModalOpen(true); // ★★★ 채팅방 모달 열기 ★★★

      } else {
        toast.error(response.message || '채팅방 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '채팅방 생성 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsModalOpen(false); // 친구 추가/차단 모달 닫기
      setSelectedMemberForModal(null);
      setIsRelationModalOpen(false); // 관계 액션 모달 닫기
      setSelectedRelationForModal(null);
    }
  };

  const handleStartChatWithFriend = (member) => {
    handleStartPrivateChat(member);
  };

  // ★★★ ChatRoomList에서 방 클릭 시 모달 열기 ★★★
  const handleRoomClick = (room) => {
    setCurrentChatRoom(room);
    setIsChatModalOpen(true);
  };
  const handleCloseChatModal = () => { setIsChatModalOpen(false); setTimeout(() => setCurrentChatRoom(null), 300); };

  // ★★★ 채팅 모달 닫기 핸들러 ★★★
  const handleOpenCreateGroupChatModal = () => {
    if (followList.length === 0) {
      toast.warn('단체 채팅방을 만들려면 먼저 친구를 추가해야 합니다.');
      return;
    }
    setIsCreateGroupChatModalOpen(true);
  };

  // ★★★ 단체 채팅방 생성 모달 닫기 핸들러 ★★★
  const handleCloseCreateGroupChatModal = () => {
    setIsCreateGroupChatModalOpen(false);
  };

 const handleCreateGroupChat = async (selectedFriendIds, roomTitle) => {
    // 유효성 검사는 모달 내부에서 처리하지만, 여기서도 한번 더 할 수 있습니다.
    if (selectedFriendIds.length === 0) {
      toast.warn('채팅에 참여할 친구를 1명 이상 선택해주세요.');
      return;
    }
    

    try {
      const response = await api.createChatRoom(selectedFriendIds, 'MULTI', roomTitle.trim());

      if (response.success && response.data?.roomId) {
        const newRoom = {
          roomId: response.data.roomId,
          roomTitle: response.data.roomTitle,
          roomType: response.data.roomType,
        };

        setMultiRooms(prevRooms => {
            const updatedRooms = [...prevRooms, newRoom];
            localStorage.setItem('multiRooms', JSON.stringify(updatedRooms));
            return updatedRooms;
        });

        toast.success(`'${newRoom.roomTitle}' 단체 채팅방이 생성되었습니다!`);
        handleCloseCreateGroupChatModal(); // 생성 모달 닫기
        setCurrentChatRoom(newRoom); // 새로 생성된 채팅방으로 설정
        setIsChatModalOpen(true); // 채팅 모달 열기

      } else {
        toast.error(response.message || '단체 채팅방 생성에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error.message || '단체 채팅방 생성 중 네트워크 오류가 발생했습니다.');
    }
  };



  if (!memberNick || !memberId) {
    return (
      <div className="auth-container home-page">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  const friendDetails = followList
    .map(relation => memberInfoList.find(info => info.memberId === relation.memberId))
    .filter(Boolean); 
    
  return (
    <div className="chat-dashboard">
      <DashboardHeader memberNick={memberNick} onLogout={handleLogout} />

      <DashboardNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabRefs={tabRefs}
        indicatorRef={indicatorRef}
        indicatorStyle={indicatorStyle}
      />

      {/* 대시보드 콘텐츠는 그대로 유지 */}
      <div className="dashboard-content">
        {activeTab === 'private' && (
          <ChatRoomList
            title="나의 1:1 채팅방"
            rooms={privateRooms}
            type="private"
            onRoomClick={handleRoomClick} 
          />
        )}
        {activeTab === 'multi' && (
          <>
            <div className="list-header">
              <h2 className="list-title">나의 단체 채팅방</h2>
              <button
                className="create-group-chat-btn"
                onClick={handleOpenCreateGroupChatModal}>
                단체 채팅방 만들기
              </button>
            </div>
            <ChatRoomList
              // title prop은 list-header에서 렌더링하므로 제거
              rooms={multiRooms}
              type="multi"
              onRoomClick={handleRoomClick}
            />
          </>
        )}
        {activeTab === 'friends' && (
          <>
            <SearchSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleKeyPress={handleKeyPress}
              handleSearch={handleSearch}
              searchLoading={searchLoading}
              searchError={searchError}
              searchResults={searchResults}
              handleSearchResultClick={handleSearchResultClick}
            />
            <RelationList
              title="나의 친구 목록"
              relations={followList}
              memberInfos={memberInfoList}
              relationType="follow"
              onRelationClick={handleRelationClick}
            />
          </>
        )}
        {activeTab === 'blocked' && (
          <RelationList
            title="나의 차단 목록"
            relations={blockList}
            memberInfos={memberInfoList}
            relationType="block"
            onRelationClick={handleRelationClick}
          />
        )}
      </div>

      {/* 기존 모달들은 그대로 */}
      <MemberActionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        member={selectedMemberForModal}
        onAddFriend={handleAddFriend}
        onBlockMember={handleBlockMember}
        onStartPrivateChat={handleStartPrivateChat}
      />

      <RelationActionModal
        isOpen={isRelationModalOpen}
        onClose={handleRelationModalClose}
        relationInfo={selectedRelationForModal}
        onUnfriend={handleUnfriend}
        onUnblock={handleUnblock}
        onStartChatWithFriend={handleStartChatWithFriend}
      />

      {/* ★★★ 채팅방 모달 렌더링 ★★★ */}
      <ChatRoomModal
        isOpen={isChatModalOpen}
        onClose={handleCloseChatModal}
        room={currentChatRoom} // 현재 선택된 채팅방 정보 전달
        memberId={memberId}
        memberNick={memberNick}
      />
      <CreateGroupChatModal
        isOpen={isCreateGroupChatModalOpen}
        onClose={handleCloseCreateGroupChatModal}
        onCreate={handleCreateGroupChat}
        friends={friendDetails}
      />
    </div>
  );
}

export default HomePage;