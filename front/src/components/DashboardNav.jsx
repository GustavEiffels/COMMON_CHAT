import React from 'react';

function DashboardNav({ activeTab, setActiveTab, tabRefs, indicatorRef, indicatorStyle }) {
  const tabs = [
    { key: 'private', label: '1:1 채팅방' },
    { key: 'multi', label: '단체 채팅방' },
    { key: 'friends', label: '친구 목록' },
    { key: 'blocked', label: '차단 목록' },
  ];

  return (
    <div className="dashboard-nav">
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => setActiveTab(tab.key)}
          ref={el => (tabRefs.current[tab.key] = el)}
        >
          {tab.label}
        </button>
      ))}
      <div className="tab-indicator" ref={indicatorRef} style={indicatorStyle}></div>
    </div>
  );
}

export default DashboardNav;