// src/SignUpPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

function SignUpPage() {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePath, setProfilePath] = useState(''); // 선택적 필드
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!nick || !email || !password || !confirmPassword) {
      setMessage('필수 필드(닉네임, 이메일, 비밀번호)를 모두 입력해주세요.');
      setMessageType('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      setMessageType('error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('유효한 이메일 주소를 입력해주세요.');
        setMessageType('error');
        return;
    }
    if (password.length < 6) { // 최소 비밀번호 길이
        setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        setMessageType('error');
        return;
    }


    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await api.signup(nick, email, password, profilePath);
      
      // status 200 이고, error 필드가 없는 경우를 성공으로 간주
      if (response.status === 200 && response.success) { // api.js에서 이미 success 필드를 만들었으므로 활용
        setMessage(response.message || '회원가입 성공!'); // api.js에서 기본 메시지 설정했으므로 활용
        setMessageType('success');
        
        // 회원가입 성공 후 바로 홈 페이지로 이동
        // (일반적으로는 로그인 페이지로 유도하지만, 요청에 따라 홈으로 이동)
        setTimeout(() => navigate('/home'), 1000);
      } else {
        // 백엔드에서 온 에러 메시지 또는 기본 에러 메시지 표시
        setMessage(response.message || '회원가입 실패: 알 수 없는 오류가 발생했습니다.');
        setMessageType('error');
      }
    } catch (error) {
      // 네트워크 오류 등 예외 발생 시
      setMessage(error.message || '네트워크 오류가 발생했습니다.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>회원가입</h2>
      <form onSubmit={handleSignUp}>
        <div className="form-group">
          <label htmlFor="nick">닉네임</label>
          <input
            type="text"
            id="nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            disabled={loading}
            placeholder="사용하실 닉네임을 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="이메일 주소를 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="비밀번호를 입력하세요 (최소 6자)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
        <div className="form-group">
          <label htmlFor="profilePath">프로필 경로 (선택)</label>
          <input
            type="text"
            id="profilePath"
            value={profilePath}
            onChange={(e) => setProfilePath(e.target.value)}
            disabled={loading}
            placeholder="프로필 이미지 경로 (선택 사항)"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      <Link to="/login" className="nav-link">
        이미 계정이 있으신가요? 로그인
      </Link>
    </div>
  );
}

export default SignUpPage;