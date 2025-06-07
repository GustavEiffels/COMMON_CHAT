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
  }
};

export default api;