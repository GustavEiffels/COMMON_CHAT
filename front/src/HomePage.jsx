// src/HomePage.jsx
import React, { useEffect, useState, useRef } from 'react'; // React Hooks 임포트
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 navigate 훅 사용
import { toast } from 'react-toastify'; // toast 함수 임포트 (알림 메시지)

// 로컬 컴포넌트 임포트
import ChatRoomList from './components/ChatRoomList'; // 채팅방 목록 표시
import RelationList from './components/RelationList'; // 친구/차단 목록 표시
import api from './api'; // 백엔드 API 서비스
import RelationActionModal from './components/RelationActionModal'; // 관계 액션 모달 임포트

// 검색 결과 클릭 시 나타나는 모달 (MemberActionModal)
// 이 컴포넌트는 HomePage.jsx 파일 상단에 그대로 둡니다.
function MemberActionModal({ isOpen, onClose, member, onAddFriend, onBlockMember, onStartPrivateChat }) {
  if (!member) {
    return null; // member 정보가 없으면 렌더링하지 않음
  }
  const modalOverlayClass = `modal-overlay ${isOpen ? 'open' : ''}`; // isOpen 상태에 따라 'open' 클래스 추가
  return (
    <div className={modalOverlayClass} onClick={onClose}> {/* 오버레이 클릭 시 모달 닫기 */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* 모달 콘텐츠 클릭 시 이벤트 버블링 방지 */}
        <h3>{member.nick}</h3> {/* 멤버 닉네임 표시 */}
        <p>님에게 어떤 작업을 수행하시겠습니까?</p>
        <div className="modal-actions"> {/* 버튼 액션 그룹 */}
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
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅 사용
  const [memberNick, setMemberNick] = useState(''); // 로그인한 사용자 닉네임 상태
  const [memberId, setMemberId] = useState(''); // 로그인한 자신의 memberId 상태 (String 타입)
  const [activeTab, setActiveTab] = useState('private'); // 활성 탭 상태 ('private', 'multi', 'friends', 'blocked')

  // 로그인 응답에서 받아온 데이터 상태 (localStorage에서 로드)
  const [privateRooms, setPrivateRooms] = useState([]); // 1:1 채팅방 목록
  const [multiRooms, setMultiRooms] = useState([]); // 단체 채팅방 목록
  const [followList, setFollowList] = useState([]); // 친구 목록 (관계 정보: RelationShip DTO)
  const [blockList, setBlockList] = useState([]); // 차단 목록 (관계 정보: RelationShip DTO)
  const [memberInfoList, setMemberInfoList] = useState([]); // 친구/차단 목록의 닉네임 조회를 위함 (MemberInfo DTO)

  // 검색 기능 관련 상태
  const [searchQuery, setSearchQuery] = useState(''); // 검색 입력값
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 멤버 리스트 (MemberInfo DTO)
  const [searchLoading, setSearchLoading] = useState(false); // 검색 로딩 상태
  const [searchError, setSearchError] = useState(''); // 검색 에러 메시지

  // MemberActionModal 관련 상태 (검색 결과 클릭 시 사용)
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태
  const [selectedMemberForModal, setSelectedMemberForModal] = useState(null); // 모달에 전달할 선택된 멤버 정보 (MemberInfo DTO)

  // RelationActionModal 관련 상태 (친구/차단 목록 클릭 시 사용)
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false); // 관계 모달 열림/닫힘 상태
  // 선택된 관계의 원본 RelationShip 객체와 해당 멤버의 MemberInfo 객체, 관계 타입을 저장
  const [selectedRelationForModal, setSelectedRelationForModal] = useState(null); 

  // 탭 인디케이터 관련 useRef 및 useState
  const tabRefs = useRef({}); // 각 탭 버튼의 DOM 요소를 참조
  const indicatorRef = useRef(null); // 탭 인디케이터 div를 참조
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 }); // 인디케이터의 스타일

  // ★★★ 초기 데이터 로딩 및 상태 업데이트 함수 ★★★
  // 컴포넌트 마운트 시 localStorage에서 사용자 정보 및 관련 리스트를 가져와 상태에 설정
  const loadInitialData = () => {
    const storedNick = localStorage.getItem('memberNick'); // localStorage에서 닉네임 가져오기
    const storedId = localStorage.getItem('memberId'); // localStorage에서 memberId 가져오기
    
    // localStorage에 저장된 JSON 문자열을 파싱하여 각 리스트 상태에 설정 (|| '[]'로 기본값 설정)
    const storedPrivateRooms = JSON.parse(localStorage.getItem('privateRooms') || '[]');
    const storedMultiRooms = JSON.parse(localStorage.getItem('multiRooms') || '[]');
    const storedFollowList = JSON.parse(localStorage.getItem('followList') || '[]');
    const storedBlockList = JSON.parse(localStorage.getItem('blockList') || '[]');
    const storedMemberInfoList = JSON.parse(localStorage.getItem('memberInfoList') || '[]');

    if (storedNick && storedId) { // 닉네임과 ID가 유효하면 상태 업데이트
      setMemberNick(storedNick);
      setMemberId(storedId); // String 그대로 저장 (비교 시 String으로 변환 필요)
      setPrivateRooms(storedPrivateRooms);
      setMultiRooms(storedMultiRooms);
      setFollowList(storedFollowList);
      setBlockList(storedBlockList);
      setMemberInfoList(storedMemberInfoList);
    } else {
      navigate('/login'); // 정보가 없으면 로그인 페이지로 리디렉션
    }
  };

  // 컴포넌트 마운트 시 loadInitialData 함수 실행
  useEffect(() => {
    loadInitialData();
  }, [navigate]); // navigate 함수가 변경될 때만 재실행 (의존성 배열)

  // ★★★ activeTab 변경 시 검색 기록 초기화 및 탭 인디케이터 업데이트 ★★★
  useEffect(() => {
    // 탭 이동 시 검색 관련 상태 초기화
    setSearchQuery('');
    setSearchResults([]);
    setSearchError('');
    setSearchLoading(false);

    // 탭 인디케이터 위치 및 너비 업데이트
    const activeTabButton = tabRefs.current[activeTab]; // 현재 활성화된 탭 버튼의 DOM 요소
    if (activeTabButton && indicatorRef.current) {
      const navRect = indicatorRef.current.parentElement.getBoundingClientRect(); // 부모 (.dashboard-nav)의 위치
      const buttonRect = activeTabButton.getBoundingClientRect(); // 활성화된 버튼의 위치

      setIndicatorStyle({
        left: buttonRect.left - navRect.left, // 부모 요소 내에서의 상대적인 left 위치
        width: buttonRect.width, // 활성화된 버튼의 너비
      });
    }
  }, [activeTab]); // activeTab 상태가 변경될 때마다 실행

  // 컴포넌트 마운트 시 및 리사이즈 시 인디케이터 초기 위치 설정
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

    window.addEventListener('resize', handleResize); // 윈도우 리사이즈 이벤트 리스너 등록
    handleResize(); // 초기 렌더링 시 한 번 호출

    return () => {
      window.removeEventListener('resize', handleResize); // 컴포넌트 언마운트 시 이벤트 리스너 제거
    };
  }, [activeTab]); // activeTab이 변경될 때마다 리사이즈 이벤트 리스너도 다시 등록/제거


  const handleLogout = () => {
    localStorage.clear(); // 모든 localStorage 데이터 삭제
    toast.info('로그아웃 되었습니다.'); // 토스트 메시지
    navigate('/login'); // 로그인 페이지로 이동
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.warn('검색어를 입력해주세요.'); // 검색어 없으면 경고
      setSearchResults([]);
      setSearchError('');
      return;
    }

    setSearchLoading(true); // 로딩 상태 활성화
    setSearchError('');
    setSearchResults([]);

    try {
      // API 호출: 닉네임으로 검색, 0페이지, 10개
      const response = await api.searchMembers(searchQuery.trim(), 'nick', 0, 10); 

      if (response.success) { // API 호출 성공
        if (response.data && Array.isArray(response.data.members)) {
          // 검색 결과에서 자기 자신 제외
          const filteredMembers = response.data.members.filter(
            (member) => String(member.memberId) !== String(memberId) // memberId는 숫자, localStorage는 문자열일 수 있으므로 String()으로 변환하여 비교
          );

          setSearchResults(filteredMembers); // 필터링된 결과로 상태 업데이트
          if (filteredMembers.length === 0) {
            toast.info('검색 결과가 없습니다.'); // 검색 결과 없으면 정보 토스트
          } else {
            toast.success(`${filteredMembers.length}명의 회원을 찾았습니다.`); // 검색 결과 수 토스트
          }
        } else {
          setSearchError('유효한 검색 결과 형식이 아닙니다.'); // 결과 형식 오류
          toast.error('검색 결과 처리 중 오류가 발생했습니다.');
        }
      } else { // API 호출 실패
        setSearchError(response.message || '회원 검색 실패'); // 에러 메시지 설정
        toast.error(response.message || '회원 검색에 실패했습니다.'); // 에러 토스트
      }
    } catch (error) {
      setSearchError(error.message || '네트워크 오류 발생'); // 네트워크 오류
      toast.error(error.message || '회원 검색 중 네트워크 오류가 발생했습니다.');
    } finally {
      setSearchLoading(false); // 로딩 상태 비활성화
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(); // 엔터 키 입력 시 검색 실행
    }
  };

  // 검색 결과 항목 클릭 핸들러 (MemberActionModal 열기)
  const handleSearchResultClick = (member) => {
    setSelectedMemberForModal(member); // 클릭된 멤버 정보 저장
    setIsModalOpen(true); // 모달 열기
  };

  // 검색 결과 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false); // 모달 닫기
    // 모달 닫기 애니메이션을 위해 setTimeout을 사용하여 member 정보를 늦게 초기화
    setTimeout(() => setSelectedMemberForModal(null), 300); // CSS transition 시간과 동일하게
  };

  // 친구 추가 버튼 클릭 핸들러 (MemberActionModal 내)
  const handleAddFriend = async (member) => {
    try {
      const response = await api.addFriend(member.memberId); // 친구 추가 API 호출
      if (response.success) {
        toast.success(`${member.nick}님을 친구로 추가했습니다!`); // 성공 토스트
        
        // followList 및 memberInfoList 업데이트
        const newRelation = response.data.relationShipDto; // API 응답에서 관계 DTO 추출
        const newMemberInfo = response.data.memberInfoDto; // API 응답에서 멤버 정보 DTO 추출

        // followList에 새 관계 추가 (중복 방지)
        setFollowList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newRelation]; // 새로운 관계 추가
        });
        
        // memberInfoList에 새 멤버 정보 추가 (중복 방지)
        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newMemberInfo]; // 새로운 멤버 정보 추가
        });

        // localStorage도 업데이트 (새로고침 시 데이터 유지)
        localStorage.setItem('followList', JSON.stringify([...followList, newRelation]));
        localStorage.setItem('memberInfoList', JSON.stringify([...memberInfoList, newMemberInfo]));

      } else {
        toast.error(response.message || `${member.nick}님 친구 추가에 실패했습니다.`); // 에러 토스트
      }
    } catch (error) {
      toast.error(error.message || '친구 추가 중 네트워크 오류가 발생했습니다.'); // 네트워크 에러 토스트
    } finally {
      handleModalClose(); // 모달 닫기
    }
  };

  // 차단 버튼 클릭 핸들러 (MemberActionModal 내)
  const handleBlockMember = async (member) => {
    try {
      const response = await api.blockMember(member.memberId); // 차단 API 호출
      if (response.success) {
        toast.success(`${member.nick}님을 차단했습니다!`); // 성공 토스트
        
        // blockList 및 memberInfoList 업데이트
        const newRelation = response.data.relationShipDto; // API 응답에서 관계 DTO 추출
        const newMemberInfo = response.data.memberInfoDto; // API 응답에서 멤버 정보 DTO 추출

        // blockList에 새 관계 추가 (중복 방지)
        setBlockList(prev => {
          if (prev.some(rel => rel.memberId === newRelation.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newRelation]; // 새로운 관계 추가
        });
        
        // memberInfoList에 새 멤버 정보 추가 (중복 방지)
        setMemberInfoList(prev => {
          if (prev.some(info => info.memberId === newMemberInfo.memberId)) {
            return prev; // 이미 있다면 추가 안함
          }
          return [...prev, newMemberInfo]; // 새로운 멤버 정보 추가
        });

        // localStorage도 업데이트 (새로고침 시 데이터 유지)
        localStorage.setItem('blockList', JSON.stringify([...blockList, newRelation]));
        localStorage.setItem('memberInfoList', JSON.stringify([...memberInfoList, newMemberInfo]));

        // 만약 친구였다면 followList에서 제거 (차단 시 친구 관계 해제)
        setFollowList(prev => prev.filter(rel => rel.memberId !== newRelation.memberId));
        localStorage.setItem('followList', JSON.stringify(followList.filter(rel => rel.memberId !== newRelation.memberId)));

      } else {
        toast.error(response.message || `${member.nick}님 차단에 실패했습니다.`); // 에러 토스트
      }
    } catch (error) {
      toast.error(error.message || '회원 차단 중 네트워크 오류가 발생했습니다.'); // 네트워크 에러 토스트
    } finally {
      handleModalClose(); // 모달 닫기
    }
  };

  // 개인 채팅하기 버튼 클릭 핸들러 (MemberActionModal 내)
  const handleStartPrivateChat = (member) => {
    toast.info(`${member.nick}님과 개인 채팅을 시작합니다! (가상)`);
    console.log('개인 채팅 시작 요청:', member);
    handleModalClose(); // 모달 닫기
    navigate(`/chat-room/${member.nick}`); // 예시 URL 이동
  };


  // ★★★ 관계 목록 항목 클릭 핸들러 (RelationActionModal 열기) ★★★
  const handleRelationClick = (relation, memberInfo, type) => {
    // relation: RelationShip 객체 (relationshipId, memberId, type)
    // memberInfo: MemberInfo 객체 (memberId, nick)
    // type: 'follow' 또는 'block' (RelationList로부터 전달받음)
    setSelectedRelationForModal({ relation, member: memberInfo, type }); // 관계, 멤버 정보, 관계 타입 저장
    setIsRelationModalOpen(true); // 관계 모달 열기
  };

  // ★★★ 관계 모달 닫기 핸들러 ★★★
  const handleRelationModalClose = () => {
    setIsRelationModalOpen(false); // 관계 모달 닫기
    setTimeout(() => setSelectedRelationForModal(null), 300); // 애니메이션 후 정보 초기화
  };

  // ★★★ 관계 모달: 친구 해제하기 버튼 클릭 핸들러 ★★★
  const handleUnfriend = async (relation, member) => {
    // 실제 친구 해제 API 호출 로직 (예: DELETE /relationships/unfollow)
    try {
      const response = await api.unfollow(relation.relationshipId); // API 호출
      if (response.success) {
        toast.success(`${member.nick}님과의 친구 관계를 해제했습니다!`); // 성공 토스트
        // followList 상태 업데이트
        setFollowList(prev => {
          const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId);
          localStorage.setItem('followList', JSON.stringify(updatedList)); // localStorage 업데이트
          return updatedList;
        });
        // memberInfoList에서 해당 멤버 정보 제거 여부는 비즈니스 로직에 따라 결정
        // (예: 친구 관계는 아니지만 여전히 다른 목록(차단)에 있거나, 검색 결과로 다시 나타날 수 있음)
      } else {
        toast.error(response.message || `${member.nick}님 친구 관계 해제에 실패했습니다.`); // 에러 토스트
      }
    } catch (error) {
      toast.error(error.message || '친구 관계 해제 중 네트워크 오류가 발생했습니다.'); // 네트워크 에러 토스트
    } finally {
      handleRelationModalClose(); // 모달 닫기
    }
  };

  // ★★★ 관계 모달: 차단 해제 버튼 클릭 핸들러 ★★★
  const handleUnblock = async (relation, member) => {
    // 실제 차단 해제 API 호출 로직 (예: DELETE /relationships/unblock)
    try {
      const response = await api.unblock(relation.relationshipId); // API 호출
      if (response.success) {
        toast.success(`${member.nick}님을 차단 해제했습니다!`); // 성공 토스트
        // blockList 상태 업데이트
        setBlockList(prev => {
          const updatedList = prev.filter(r => r.relationshipId !== relation.relationshipId);
          localStorage.setItem('blockList', JSON.stringify(updatedList)); // localStorage 업데이트
          return updatedList;
        });
        
        // 만약 친구 목록에 차단 해제된 사람이 다시 친구로 나타나야 한다면,
        // 해당 로직도 추가해야 합니다. (여기서는 간단히 처리)
        // 예: setFollowList(prev => [...prev, { relationshipId: newId, memberId: member.memberId, type: 'FAVORITE' }]);
        // localStorage.setItem('followList', JSON.stringify([...followList, { relationshipId: newId, memberId: member.memberId, type: 'FAVORITE' }]));
      } else {
        toast.error(response.message || `${member.nick}님 차단 해제에 실패했습니다.`); // 에러 토스트
      }
    } catch (error) {
      toast.error(error.message || '차단 해제 중 네트워크 오류가 발생했습니다.'); // 네트워크 에러 토스트
    } finally {
      handleRelationModalClose(); // 모달 닫기
    }
  };

  // 관계 모달: 친구와 채팅하기 버튼 클릭 핸들러
  const handleStartChatWithFriend = (member) => {
    toast.info(`${member.nick}님과 채팅을 시작합니다! (가상 - 친구목록에서)`);
    console.log('친구와 채팅 시작 요청:', member);
    handleRelationModalClose(); // 모달 닫기
    navigate(`/chat-room/${member.nick}`); // 예시 URL 이동
  };


  if (!memberNick || !memberId) { // memberNick 또는 memberId가 없으면 로딩 메시지 표시
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
        {activeTab === 'private' && ( // 1:1 채팅방 탭 내용
          <ChatRoomList title="나의 1:1 채팅방" rooms={privateRooms} type="private" />
        )}
        {activeTab === 'multi' && ( // 단체 채팅방 탭 내용
          <ChatRoomList title="나의 단체 채팅방" rooms={multiRooms} type="multi" />
        )}
        {activeTab === 'friends' && ( // 친구 목록 탭 내용
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
              
              {searchResults.length > 0 && ( // 검색 결과가 있을 때만 표시
                <div className="search-results">
                  <h4>검색 결과</h4>
                  <ul className="item-list">
                    {searchResults.map((member) => ( // 검색 결과 멤버 렌더링
                      <li key={member.memberId} onClick={() => handleSearchResultClick(member)}>
                        <span>{member.nick}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 관계 목록 컴포넌트: 친구 목록 */}
            <RelationList 
              title="나의 친구 목록" 
              relations={followList} 
              memberInfos={memberInfoList} 
              relationType="follow" 
              onRelationClick={handleRelationClick} // 클릭 이벤트 전달
            />
          </>
        )}
        {activeTab === 'blocked' && ( // 차단 목록 탭 내용
          <RelationList 
            title="나의 차단 목록" 
            relations={blockList} 
            memberInfos={memberInfoList} 
            relationType="block" 
            onRelationClick={handleRelationClick} // 클릭 이벤트 전달
          />
        )}
      </div>

      {/* 검색 결과 클릭 시 모달 (MemberActionModal) */}
      <MemberActionModal
        isOpen={isModalOpen} // 모달 열림 상태
        onClose={handleModalClose} // 모달 닫기 핸들러
        member={selectedMemberForModal} // 선택된 멤버 정보
        onAddFriend={handleAddFriend} // 친구 추가 핸들러
        onBlockMember={handleBlockMember} // 차단 핸들러
        onStartPrivateChat={handleStartPrivateChat} // 개인 채팅 핸들러
      />

      {/* ★★★ 관계 목록 클릭 시 모달 (RelationActionModal) ★★★ */}
      <RelationActionModal
        isOpen={isRelationModalOpen} // 관계 모달 열림 상태
        onClose={handleRelationModalClose} // 관계 모달 닫기 핸들러
        relationInfo={selectedRelationForModal} // 선택된 관계 정보
        onUnfriend={handleUnfriend} // 친구 해제 핸들러
        onUnblock={handleUnblock} // 차단 해제 핸들러
        onStartChatWithFriend={handleStartChatWithFriend} // 관계 모달에서 채팅 시작 핸들러
      />
    </div>
  );
}

export default HomePage;