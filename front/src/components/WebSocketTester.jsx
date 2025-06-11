// src/components/WebSocketTester.jsx (새로운 파일)
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import SockJS from 'sockjs-client'; // SockJS를 사용하는 Spring 백엔드와 호환
import { Stomp } from '@stomp/stompjs';

function WebSocketTester() {
   const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef(null); // STOMP 클라이언트 인스턴스 저장

  // WebSocket(STOMP) 연결 함수
  const connectWebSocket = () => {
    if (stompClient.current && stompClient.current.connected) {
      toast.info('WebSocket이 이미 연결되어 있습니다.');
      return;
    }

    // ★★★ 이 URL을 실제 Spring Boot WebSocket 엔드포인트로 변경해야 합니다. ★★★
    // StompConfig의 .addEndpoint("/chat")에 매핑됩니다.
    const socket = new SockJS(`http://localhost:8888/chat`); // 토큰 없음
    stompClient.current = Stomp.over(socket);

    // STOMP 연결 시도
    stompClient.current.connect({}, (frame) => {
      setIsConnected(true);
      toast.success('WebSocket (STOMP) 연결 성공!');
      console.log('STOMP Connected:', frame);



    }, (error) => {
      setIsConnected(false);
      toast.error('WebSocket (STOMP) 연결 오류 발생!');
      console.error('STOMP Connection Error:', error);
    });
  };

  // WebSocket(STOMP) 연결 해제 함수
  const disconnectWebSocket = () => {
    if (stompClient.current) {
      if (stompClient.current.connected) {
        stompClient.current.disconnect(() => {
          setIsConnected(false);
          toast.warn('WebSocket (STOMP) 연결이 종료되었습니다.');
          console.log("STOMP Disconnected gracefully.");
        });
      }
      stompClient.current = null;
    }
  };

  // 컴포넌트 언마운트 시 WebSocket 연결 정리
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, []);

  // 웹소켓 연결 상태 토글
  const handleToggleWebSocketConnection = () => {
    if (isConnected) {
      disconnectWebSocket();
    } else {
      connectWebSocket();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>WebSocket 연결 테스터</h1>

      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '40px'
      }}>
        <button
          onClick={handleToggleWebSocketConnection}
          style={{
            padding: '12px 25px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1em',
            fontWeight: 'bold',
            backgroundColor: isConnected ? '#dc3545' : '#28a745', // 연결되면 빨간색 (끊기), 아니면 초록색 (연결)
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {isConnected ? 'STOMP 연결 끊기' : 'STOMP 연결 시도'}
        </button>
      </div>

      <div style={{
        fontSize: '1.2em',
        fontWeight: 'bold',
        color: isConnected ? '#28a745' : '#dc3545'
      }}>
        현재 상태: {isConnected ? '연결됨 (Connected)' : '연결 안 됨 (Disconnected)'}
      </div>

      <p style={{ marginTop: '30px', color: '#888', textAlign: 'center', maxWidth: '600px' }}>
        버튼을 클릭하여 WebSocket 연결을 테스트하세요. <br/>
        결과는 토스트 알림과 브라우저 콘솔(F12)에서 확인할 수 있습니다.
      </p>
    </div>
  );
}

export default WebSocketTester;