// src/api.js
const API_BASE_URL = 'http://localhost:8080';

const api = {
  // 로그인 API 호출
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/members/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // ApiResponse<ApiMemberDto.LoginResponse> 형태로 파싱

      console.log(data)
      // ApiResponse의 status 필드와 isSuccess (혹은 error 필드 존재 여부)를 기반으로 판단
      // 200 OK 이면서 error 필드가 없는 경우를 성공으로 간주
      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '로그인 성공!', data: data.data, status: data.status };
      } else {
        // 서버에서 비즈니스 로직 오류 또는 다른 상태 코드를 줄 경우
        const errorMessage = data.error ? data.error.message : (data.message || '로그인 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage, status: data.status };
      }
    } catch (error) {
      console.error('API Error during login:', error);
      return { success: false, message: '네트워크 오류 또는 서버에 연결할 수 없습니다.', status: 0 }; // status 0은 네트워크 오류 등
    }
  },

  // 회원가입 API 호출
  signup: async (nick, email, password, profilePath = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nick, email, password, profilePath }),
      });

      const data = await response.json(); // ApiResponse<ApiMemberDto.SignUpResponse> 형태로 파싱

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
    searchMembers: async (query, type = 'nick', page = 0, size = 10) => {
    try {
      // URL 쿼리 파라미터로 page와 size를 전달합니다.
      const response = await fetch(`${API_BASE_URL}/members/search/${type}/${query}?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 인증이 필요한 API라면 JWT 토큰을 포함해야 합니다.
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
      });

      const data = await response.json(); // ApiResponse<ApiMemberDto.SearchResponse> 형태로 파싱

      console.log('API Response data:', data);

      // response.data는 백엔드의 ApiMemberDto.SearchResponse (Page 객체) 전체를 의미합니다.
      if (response.ok && data.status === 200 && !data.error) {
        // 백엔드에서 반환하는 data.data는 ApiMemberDto.SearchResponse 객체 전체입니다.
        // 이 객체는 content, totalPages, totalElements 등의 속성을 가집니다.
        return { success: true, message: data.message || '검색 성공!', data: data.data };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '검색 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during searchMembers:', error);
      return { success: false, message: '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },
  addFriend: async (toMemberId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/relationships/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ toMemberId }), // toMemberId를 요청 본문에 포함
      });

      const data = await response.json();

      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '친구 추가 성공!', data: data.data };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '친구 추가 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during addFriend:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },
   blockMember: async (toMemberId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/relationships/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ toMemberId }), // toMemberId를 요청 본문에 포함
      });

      const data = await response.json();

      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '회원 차단 성공!', data: data.data };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '회원 차단 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during blockMember:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },

  // ★★★ 친구 해제 API 호출 ★★★
  unfollow: async (relationshipId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/relationships/unfollow`, {
        method: 'POST', // 백엔드 @PostMapping에 맞춤
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ relationshipId }), // toMemberId를 요청 본문에 포함
      });

      const data = await response.json(); // ApiResponse<Void> 형태도 파싱 가능

      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '친구 관계 해제 성공!' };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '친구 관계 해제 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during unfollow:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },

  // ★★★ 차단 해제 API 호출 ★★★
  unblock: async (relationshipId) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await fetch(`${API_BASE_URL}/relationships/unblock`, {
        method: 'POST', // 백엔드 @PostMapping에 맞춤
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ relationshipId }), // toMemberId를 요청 본문에 포함
      }
      );

      const data = await response.json();

      if (response.ok && data.status === 200 && !data.error) {
        return { success: true, message: data.message || '차단 해제 성공!' };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '차단 해제 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during unblock:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  },

  createChatRoom: async (memberIds, type, title) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
      }

      console.log('memberIds : ',memberIds)
      console.log('memberIds : ',title)


      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ memberIds, type, title}),
      });

      const data = await response.json(); 


      if (response.ok && data.status === 200 && !data.error) {
        // ★★★ data.data에 roomId, roomTitle, roomType이 모두 포함되도록 반환 ★★★
        return { success: true, message: data.message || '채팅방 생성 성공!', data: data.data };
      } else {
        const errorMessage = data.error ? data.error.message : (data.message || '채팅방 생성 실패: 알 수 없는 오류');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('API Error during createChatRoom:', error);
      return { success: false, message: error.message || '네트워크 오류 또는 서버에 연결할 수 없습니다.' };
    }
  }
};

export default api;
