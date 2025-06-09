// src/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChatRoomList from './components/ChatRoomList';
import RelationList from './components/RelationList';
import api from './api';

// 모달 컴포넌트는 HomePage.jsx 파일 상단에 그대로 둡니다.
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

function HomePage() {
  const navigate = useNavigate();
  const [memberNick, setMemberNick] = useState('');
  const [memberId, setMemberId] = useState(''); // 로그인한 자신의 memberId 상태
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

  const tabRefs = useRef({});
  const indicatorRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  // ★★★ 초기 데이터 로딩 및 상태 업데이트 함수 ★★★
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
    loadInitialData(); // 컴포넌트 마운트 시 초기 데이터 로드
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
    localStorage.clear(); // 모든 localStorage 데이터 삭제
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

  // ★★★ 친구 추가 버튼 클릭 핸들러 (모달 내) ★★★
  const handleAddFriend = async (member) => {
    try {
      const response = await api.addFriend(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 친구로 추가했습니다!`);
        // ★★★ followList 및 memberInfoList 업데이트 ★★★
        const newRelation = response.data.relationShipDto; // RelationShipDto
        const newMemberInfo = response.data.memberInfoDto; // MemberInfoDto

        // followList에 새 관계 추가 (중복 방지)
        setFollowList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newRelation];
        });
        
        // memberInfoList에 새 멤버 정보 추가 (중복 방지)
        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newMemberInfo];
        });

        // localStorage도 업데이트 (새로고침 시 데이터 유지)
        localStorage.setItem('followList', JSON.stringify([...followList, newRelation]));
        localStorage.setItem('memberInfoList', JSON.stringify([...memberInfoList, newMemberInfo]));

      } else {
        toast.error(response.message || `${member.nick}님 친구 추가에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '친구 추가 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleModalClose(); // 모달 닫기
    }
  };

  // ★★★ 차단 버튼 클릭 핸들러 (모달 내) ★★★
  const handleBlockMember = async (member) => {
    try {
      const response = await api.blockMember(member.memberId);
      if (response.success) {
        toast.success(`${member.nick}님을 차단했습니다!`);
        // ★★★ blockList 및 memberInfoList 업데이트 ★★★
        const newRelation = response.data.relationShipDto; // RelationShipDto
        const newMemberInfo = response.data.memberInfoDto; // MemberInfoDto

        // blockList에 새 관계 추가 (중복 방지)
        setBlockList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev;
          }
          return [...prev, newRelation];
        });
        
        // memberInfoList에 새 멤버 정보 추가 (중복 방지)
        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev;
          }
          return [...prev, newMemberInfo];
        });

        // localStorage도 업데이트 (새로고침 시 데이터 유지)
        localStorage.setItem('blockList', JSON.stringify([...blockList, newRelation]));
        localStorage.setItem('memberInfoList', JSON.stringify([...memberInfoList, newMemberInfo]));

        // 만약 친구였다면 followList에서 제거하는 로직도 필요 (선택 사항)
        setFollowList(prev => prev.filter(rel => rel.memberId !== newRelation.memberId));
        localStorage.setItem('followList', JSON.stringify(followList.filter(rel => rel.memberId !== newRelation.memberId)));

      } else {
        toast.error(response.message || `${member.nick}님 차단에 실패했습니다.`);
      }
    } catch (error) {
      toast.error(error.message || '회원 차단 중 네트워크 오류가 발생했습니다.');
    } finally {
      handleModalClose(); // 모달 닫기
    }
  };

  // 개인 채팅하기 버튼 클릭 핸들러 (모달 내)
  const handleStartPrivateChat = (member) => {
    toast.info(`${member.nick}님과 개인 채팅을 시작합니다! (가상)`);
    console.log('개인 채팅 시작 요청:', member);
    handleModalClose();
    navigate(`/chat-room/${member.nick}`); // 예시 URL 이동
  };


  if (!memberNick || !memberId) {
    return (
      <div className="auth-container home-page">
        <p>사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="chat-dashboard">
      <div className="dashboard-header">
        <h2>환영합니다, {memberNick}님!</h2>
        <button onClick={handleLogout}>로그아웃</button>
      </div>

      <div className="dashboard-nav">
        <button
          className={activeTab === 'private' ? 'active' : ''}
          onClick={() => setActiveTab('private')}
          ref={el => tabRefs.current['private'] = el}
        >
          1:1 채팅방
        </button>
        <button
          className={activeTab === 'multi' ? 'active' : ''}
          onClick={() => setActiveTab('multi')}
          ref={el => tabRefs.current['multi'] = el}
        >
          단체 채팅방
        </button>
        <button
          className={activeTab === 'friends' ? 'active' : ''}
          onClick={() => setActiveTab('friends')}
          ref={el => tabRefs.current['friends'] = el}
        >
          친구 목록
        </button>
        <button
          className={activeTab === 'blocked' ? 'active' : ''}
          onClick={() => setActiveTab('blocked')}
          ref={el => tabRefs.current['blocked'] = el}
        >
          차단 목록
        </button>
        
        <div className="tab-indicator" ref={indicatorRef} style={indicatorStyle}></div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'private' && (
          <ChatRoomList title="나의 1:1 채팅방" rooms={privateRooms} type="private" />
        )}
        {activeTab === 'multi' && (
          <ChatRoomList title="나의 단체 채팅방" rooms={multiRooms} type="multi" />
        )}
        {activeTab === 'friends' && (
          <>
            <div className="search-section">
              <h3>새로운 친구 찾기</h3>
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="닉네임으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={searchLoading}
                />
                <button onClick={handleSearch} disabled={searchLoading}>
                  {searchLoading ? '검색 중...' : '검색'}
                </button>
              </div>

              {searchError && <p className="message error">{searchError}</p>}
              
              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>검색 결과</h4>
                  <ul className="item-list">
                    {searchResults.map((member) => (
                      <li key={member.memberId} onClick={() => handleSearchResultClick(member)}>
                        <span>{member.nick}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <RelationList title="나의 친구 목록" relations={followList} memberInfos={memberInfoList} relationType="follow" />
          </>
        )}
        {activeTab === 'blocked' && (
          <RelationList title="나의 차단 목록" relations={blockList} memberInfos={memberInfoList} relationType="block" />
        )}
      </div>

      <MemberActionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        member={selectedMemberForModal}
        onAddFriend={handleAddFriend}
        onBlockMember={handleBlockMember}
        onStartPrivateChat={handleStartPrivateChat}
      />
    </div>
  );
}

export default HomePage;