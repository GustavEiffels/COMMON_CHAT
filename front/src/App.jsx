// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import SignUpPage from './SignUpPage.jsx';
import HomePage from './HomePage.jsx';

// react-toastify 관련 임포트
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // react-toastify 기본 CSS

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      {/* ToastContainer를 App 컴포넌트의 최상위에 추가 */}
      <ToastContainer
        position="top-right" // 토스트 위치 (top-right, top-center, bottom-left 등)
        autoClose={3000}     // 토스트가 자동으로 사라지는 시간 (ms)
        hideProgressBar={false} // 진행 바 표시 여부
        newestOnTop={false}   // 새로운 토스트가 가장 위에 올지 여부
        closeOnClick        // 클릭 시 토스트 닫기
        rtl={false}         // RTL 언어 지원 여부
        pauseOnFocusLoss    // 창 포커스 잃었을 때 토스트 일시정지
        draggable           // 드래그 가능 여부
        pauseOnHover        // 호버 시 토스트 일시정지
        theme="light"       // 테마 (light, dark, colored)
      />
    </>
  );
}

export default App;