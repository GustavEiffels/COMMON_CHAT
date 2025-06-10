import React from 'react';

function SearchSection({
  searchQuery,
  setSearchQuery,
  handleKeyPress,
  handleSearch,
  searchLoading,
  searchError,
  searchResults,
  handleSearchResultClick,
}) {
  return (
    <div className="search-section">
      <h3>새로운 친구 찾기</h3>
      <div className="search-input-group">
        <input
          type="text"
          placeholder="닉네임으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={searchLoading}
        />
        <button onClick={handleSearch} disabled={searchLoading}>
          {searchLoading ? '검색 중...' : '검색'}
        </button>
      </div>

      {searchError && <p className="message error">{searchError}</p>}
      
      {searchResults.length > 0 && (
        <div className="search-results">
          <h4>검색 결과</h4>
          <ul className="item-list">
            {searchResults.map((member) => (
              <li key={member.memberId} onClick={() => handleSearchResultClick(member)}>
                <span>{member.nick}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchSection;