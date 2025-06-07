// src/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage('이메일과 비밀번호를 모두 입력해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await api.login(email, password);
      
      // status 200 이고, error 필드가 없는 경우를 성공으로 간주
      if (response.status === 200 && response.success) { // api.js에서 이미 success 필드를 만들었으므로 활용
        setMessage(response.message || '로그인 성공!'); // api.js에서 기본 메시지 설정했으므로 활용
        setMessageType('success');
        
        // 로그인 성공 후 받은 데이터 (예: 토큰, 사용자 정보)를 localStorage 등에 저장
        // console.log('로그인 데이터:', response.data);
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('memberNick', response.data.nick); // 닉네임 저장
        localStorage.setItem('memberId', response.data.memberId); // 멤버 ID 저장

        setTimeout(() => navigate('/home'), 500); // 로그인 성공 후 홈 페이지로 이동
      } else {
        // 백엔드에서 온 에러 메시지 또는 기본 에러 메시지 표시
        setMessage(response.message || '로그인 실패: 알 수 없는 오류가 발생했습니다.');
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
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            placeholder="이메일을 입력하세요"
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
            placeholder="비밀번호를 입력하세요"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
      <Link to="/signup" className="nav-link">
        아직 계정이 없으신가요? 회원가입
      </Link>
    </div>
  );
}

export default LoginPage;