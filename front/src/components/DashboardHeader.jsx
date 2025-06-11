import React from 'react';

function DashboardHeader({ memberNick, onLogout }) {
  return (
    <div className="dashboard-header">
      <h2>환영합니다 {memberNick}님!</h2>
      <button onClick={onLogout}>로그아웃</button>
    </div>
  );
}

export default DashboardHeader;