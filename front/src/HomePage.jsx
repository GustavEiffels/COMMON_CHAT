// src/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [memberNick, setMemberNick] = useState('');
  const [memberId, setMemberId] = useState('');

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기
    const storedNick = localStorage.getItem('memberNick');
    const storedId = localStorage.getItem('memberId');
    if (storedNick && storedId) {
      setMemberNick(storedNick);
      setMemberId(storedId);
    } else {
      // 정보가 없으면 로그인 페이지로 리디렉션
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // localStorage에서 모든 인증 관련 정보 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberNick');
    localStorage.removeItem('memberId');
    // 필요한 다른 정보도 삭제

    alert('로그아웃 되었습니다.');
    navigate('/login');
  };

  return (
    <div className="auth-container home-page">
      <h2>환영합니다!</h2>
      {memberNick && memberId ? (
        <>
          <p>
            <strong>{memberNick}</strong>님 (ID: {memberId}) 로그인 성공!
          </p>
          <p>
            이제 채팅 서비스 및 다른 기능들을 이용할 수 있습니다.
          </p>
        </>
      ) : (
        <p>사용자 정보를 불러오는 중...</p>
      )}
      <button onClick={handleLogout}>로그아웃</button>
    </div>
  );
}

export default HomePage;