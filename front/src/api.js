// src/api.js

const API_BASE_URL = 'http://localhost:8080';

const api = {
  // ... (로그인, 회원가입 함수는 변경 없음) ...
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/members/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login API 응답:', data);

      if (response.ok && data.status === 200 && !data.error) {
        if (data.data.accessToken && data.data.refreshToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        } else {
          console.warn('Login API 응답에 accessToken 또는 refreshToken이 없습니다.', data.data);
        }

        return { success: true, message: data.message || '로그인 성공!', data: data.data, status: data.status };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '로그인 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage, status: data.status };
      }
    } catch (error) {
      console.error('API Error during login:', error);
      return { success: false, message: '네트워크 오류 또는 서버에 연결할 수 없습니다.', status: 0 };
    }
  },

  signup: async (nick, email, password, profilePath = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nick, email, password, profilePath }),
      });

      const data = await response.json();
      console.log('Signup API 응답:', data);

      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '회원가입 성공!', data: data.data, status: data.status };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '회원가입 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage, status: data.status };
      }
    } catch (error) {
      console.error('API Error during signup:', error);
      return { success: false, message: '네트워크 오류 또는 서버에 연결할 수 없습니다.', status: 0 };
    }
  },

  reissueAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      console.log('refreshToken : '+refreshToken)
      if (!refreshToken) {
        console.error('Refresh Token이 없습니다. 로그인 상태가 아닙니다.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return { success: false, message: 'Refresh Token이 없어 토큰 재발급 실패' };
      }

      console.log('Refresh Token 재발급 시도 중...');

      const response = await fetch(`${API_BASE_URL}/members/reissue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });

      const data = await response.json();
      console.log('재발급 응답:', data);

      if (response.ok && data.status === 200 && !data.error) {
        localStorage.setItem('accessToken', data.data.newAccessToken);
        console.log('Access Token 재발급 성공!');
        return { success: true, newAccessToken: data.data.newAccessToken };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || 'Refresh Token 재발급 실패: 알 수 없는 오류');
        console.error('Refresh Token 재발급 실패:', errorMessage);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during reissueAccessToken:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('네트워크 오류 또는 서버에 연결할 수 없습니다. 다시 로그인해주세요.');
      window.location.href = '/login';
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },

  // 모든 API 요청을 처리할 범용 래퍼 함수 (인터셉터 역할)
  authenticatedRequest: async function(url, options = {}) {
    let accessToken = localStorage.getItem('accessToken');
    const originalHeaders = options.headers || {};

    // 첫 번째 시도 (기존 Access Token 사용)
    options.headers = {
      ...originalHeaders,
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json().catch(() => ({}));

      // 401 에러, 특히 JWT 만료 메시지 확인
      if (response.status === 401 && data.error?.errorCode === "JWT_EXPIRE_EXCEPTION") {
        console.warn('Access Token 만료 감지, Refresh Token으로 재발급 시도 중...');
        const reissueResult = await this.reissueAccessToken(); // api.reissueAccessToken 호출

        if (reissueResult.success) {
          // 재발급 성공 시, 새로운 Access Token으로 헤더 갱신하고 재시도
          accessToken = reissueResult.newAccessToken;
          options.headers = {
            ...originalHeaders,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // 새로운 토큰으로 업데이트
          };

          console.log('새로운 Access Token으로 요청 재시도 중...');
          const retryResponse = await fetch(url, options);
          const retryData = await retryResponse.json().catch(() => ({}));

          if (retryResponse.ok && retryData.status === 200 && !retryData.error) {
            return { success: true, message: retryData.message, data: retryData.data, status: retryData.status };
          } else {
            // 재시도 실패 시 (Refresh Token이 재발급은 되었으나 원래 요청이 실패한 경우 등)
            console.error('재시도 요청 실패:', retryData.error?.message || retryData.message || '알 수 없는 오류');
            return { success: false, message: retryData.error ? retryData.error.message : (retryData.message || '재시도 요청 실패: 알 수 없는 오류'), status: retryData.status, data: retryData.data };
          }
        } else {
          // Refresh Token 재발급 실패 시 (reissueAccessToken 함수에서 이미 로그인 페이지로 리다이렉트 처리됨)
          return { success: false, message: reissueResult.message, status: data.status };
        }
      }

      // 401 에러이지만 JWT 만료가 아닌 다른 인증 오류
      if (response.status === 401) {
           console.error('인증 오류 (401):', data.error?.message || data.message || '알 수 없는 인증 오류');
           localStorage.removeItem('accessToken');
           localStorage.removeItem('refreshToken');
           alert('인증 정보가 유효하지 않습니다. 다시 로그인해주세요.');
           window.location.href = '/login';
           return { success: false, message: data.error?.message || data.message || '인증 정보가 유효하지 않습니다.', status: 401 };
      }

      // 성공 또는 다른 종류의 에러 처리 (200 OK, 400 Bad Request, 500 Internal Server Error 등)
      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message, data: data.data, status: data.status };
      } else {
        return { success: false, message: data.error ? data.error.message : (data.message || 'API 오류: 알 수 없는 오류'), status: data.status, data: data.data };
      }

    } catch (error) {
      console.error('API Error during authenticatedRequest:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.', status: 0 };
    }
  },

  // ... (이하 모든 인증이 필요한 API 호출은 `api.authenticatedRequest`로 변경됨) ...

  searchMembers: async (query, type = 'nick', page = 0, size = 10) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/members/search/${type}/${query}?page=${page}&size=${size}`,
      { method: 'GET' }
    );
  },

  addFriend: async (toMemberId) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/relationships/follow`,
      { method: 'POST', body: JSON.stringify({ toMemberId }) }
    );
  },

  blockMember: async (toMemberId) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/relationships/block`,
      { method: 'POST', body: JSON.stringify({ toMemberId }) }
    );
  },

  unfollow: async (relationshipId) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/relationships/unfollow`,
      { method: 'POST', body: JSON.stringify({ relationshipId }) }
    );
  },

  unblock: async (relationshipId) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/relationships/unblock`,
      { method: 'POST', body: JSON.stringify({ relationshipId }) }
    );
  },

  createChatRoom: async (memberIds, type, title) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/rooms`,
      { method: 'POST', body: JSON.stringify({ memberIds, type, title }) }
    );
  },

  invite: async (roomPid, fromMemberId, toMemberId) => {
    return api.authenticatedRequest(
      `${API_BASE_URL}/invite`,
      { method: 'POST', body: JSON.stringify({ roomPid, fromMemberId, toMemberId }) }
    );
  }
};

export default api;