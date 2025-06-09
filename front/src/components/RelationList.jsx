// src/components/RelationList.jsx
import React from 'react';

// onRelationClick prop 추가
function RelationList({ title, relations, memberInfos, relationType, onRelationClick }) {
  if (!relations || relations.length === 0) {
    return <p className="no-data-message">아직 {title}이 없습니다.</p>;
  }

  // memberInfos를 Map 형태로 변환하여 효율적인 닉네임 조회
  const memberNickMap = new Map(memberInfos.map(info => [info.memberId, info.nick]));

  return (
    <div className="list-section">
      <h3>{title}</h3>
      <ul className="item-list">
        {relations.map((rel) => {
          const relatedNick = memberNickMap.get(rel.memberId) || `알 수 없음 (ID: ${rel.memberId})`;
          // 'relatedMemberInfo'는 MemberInfo 객체 (memberId, nick)
          const relatedMemberInfo = memberInfos.find(info => info.memberId === rel.memberId); 

          return (
            // ★★★ onClick 이벤트 추가 ★★★
            // 클릭 시 onRelationClick prop으로 관계, 멤버 정보, 관계 타입을 전달
            <li 
              key={rel.relationshipId} 
              onClick={() => onRelationClick(rel, relatedMemberInfo, relationType)}
              style={{ cursor: 'pointer' }} // 클릭 가능함을 시각적으로 나타냄
            >
              <span>{relatedNick}</span>
              <span className={`type ${relationType === 'follow' ? 'follow' : 'block'}`}>
                {relationType === 'follow' ? '친구' : '차단'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RelationList;