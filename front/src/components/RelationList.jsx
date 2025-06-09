// src/components/RelationList.jsx
import React from 'react';

function RelationList({ title, relations, memberInfos, relationType }) {
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
          return (
            <li key={rel.relationshipId}>
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