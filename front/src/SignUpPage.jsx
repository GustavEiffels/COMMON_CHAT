// src/SignUpPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from './api';
import { toast } from 'react-toastify'; // toast 함수 임포트

function SignUpPage() {
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePath, setProfilePath] = useState(''); // 선택적 필드
  // const [message, setMessage] = useState(''); // <-- 제거
  // const [messageType, setMessageType] = useState(''); // <-- 제거
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!nick || !email || !password || !confirmPassword) {
      toast.error('필수 필드(닉네임, 이메일, 비밀번호)를 모두 입력해주세요.'); // <-- toast.error 사용
      return;
    }
    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.'); // <-- toast.error 사용
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('유효한 이메일 주소를 입력해주세요.'); // <-- toast.error 사용
        return;
    }
    if (password.length < 6) {
        toast.error('비밀번호는 최소 6자 이상이어야 합니다.'); // <-- toast.error 사용
        return;
    }


    setLoading(true);
    // setMessage(''); // <-- 제거
    // setMessageType(''); // <-- 제거

    try {
      const response = await api.signup(nick, email, password, '');
      
      if (response.status === 200 && response.success) {
        toast.success(response.message || '회원가입 성공!'); // <-- toast.success 사용
        
        navigate('/home')
      } else {
        toast.error(response.message || '회원가입 실패: 알 수 없는 오류가 발생했습니다.'); // <-- toast.error 사용
      }
    } catch (error) {
      toast.error(error.message || '네트워크 오류가 발생했습니다.'); // <-- toast.error 사용
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
        <button type="submit" disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
      {/* message와 messageType을 사용하는 div는 제거 */}
      {/* {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )} */}
      <Link to="/login" className="nav-link">
        이미 계정이 있으신가요? 로그인
      </Link>
    </div>
  );
}

export default SignUpPage;