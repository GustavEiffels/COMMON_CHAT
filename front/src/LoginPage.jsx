// src/LoginPage.jsx (일부 수정)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import { toast } from 'react-toastify';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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
      
      if (response.status === 200 && response.success) {
        toast.success(response.message || '로그인 성공!');
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('memberNick', response.data.nick);
        localStorage.setItem('memberId', response.data.memberId);
        localStorage.setItem('privateRooms', JSON.stringify(response.data.privateRoom || []));
        localStorage.setItem('multiRooms', JSON.stringify(response.data.multiRoom || []));
        localStorage.setItem('followList', JSON.stringify(response.data.followList || []));
        localStorage.setItem('blockList', JSON.stringify(response.data.blockList || []));
        localStorage.setItem('memberInfoList', JSON.stringify(response.data.memberInfoList || []));


        setTimeout(() => navigate('/home'), 500);
      } else {
        setMessage(response.message || '로그인 실패: 알 수 없는 오류가 발생했습니다.');
        setMessageType('error');
      }
    } catch (error) {
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