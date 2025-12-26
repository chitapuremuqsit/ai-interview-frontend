import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import interviewAPI from '../../services/interviewAPI';
import socketService from '../../services/socketService';
import './Interview.css';

function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        setInputMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'no-speech') {
          setError('No speech detected. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      setError('');
      setInputMessage('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const speakText = useCallback((text) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const startInterview = useCallback(async () => {
    try {
      await interviewAPI.startInterview(id);
      console.log('Interview started successfully');
    } catch (error) {
      console.error('Failed to start interview:', error);
      throw error;
    }
  }, [id]);

  const connectWebSocket = useCallback(async () => {
    try {
      await socketService.connect(id);
      setIsConnected(true);

      const handleMessage = (data) => {
        console.log('Received message:', data);

        if (data.type === 'ai_response' || data.type === 'question') {
          const aiMessage = data.text || data.message || data.content;
          setMessages((prev) => [...prev, {
            sender: 'ai',
            text: aiMessage
          }]);

          speakText(aiMessage);
        }
      };

      socketService.onMessage(handleMessage);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setError('Failed to connect to interview server');
      setIsConnected(false);
    }
  }, [id, speakText]);

  const initializeInterview = useCallback(async () => {
    try {
      await startInterview();
      await connectWebSocket();
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      setError('Failed to start interview. Please try again.');
    }
  }, [startInterview, connectWebSocket]);

  useEffect(() => {
    // Initialize speech synthesis ref
    synthRef.current = window.speechSynthesis;

    // Copy ref value for cleanup
    const currentSynth = synthRef.current;

    initializeInterview();
    setupSpeechRecognition();

    return () => {
      socketService.disconnect();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (currentSynth) {
        currentSynth.cancel();
      }
    };
  }, [initializeInterview, setupSpeechRecognition]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || isEnded) return;

    stopSpeaking();

    const message = { sender: 'user', text: inputMessage };
    setMessages((prev) => [...prev, message]);

    socketService.send({
      type: 'user_message',
      text: inputMessage,
      interviewId: parseInt(id)
    });

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endInterview = async () => {
    if (isEnded) return;

    stopSpeaking();
    setIsEnded(true);

    try {
      await interviewAPI.endInterview(id);
      socketService.disconnect();

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Failed to end interview:', error);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  };

  return (
    <div className="interview-room">
      <div className="interview-header">
        <div>
          <h2>AI Interview in Progress</h2>
          {!isConnected && !isEnded && (
            <p style={{ color: '#666', fontSize: '14px' }}>Connecting...</p>
          )}
          {isConnected && !isEnded && (
            <p style={{ color: '#4caf50', fontSize: '14px' }}>● Connected</p>
          )}
          {isEnded && (
            <p style={{ color: '#999', fontSize: '14px' }}>Interview ended. Redirecting to dashboard...</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="btn"
              style={{ background: '#ff9800' }}
            >
              🔇 Stop Speaking
            </button>
          )}
          <button
            onClick={endInterview}
            disabled={isEnded}
            className="btn btn-danger"
          >
            {isEnded ? 'Ending...' : 'End Interview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ margin: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              Waiting for interviewer...
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <div className="message-content">
                <strong>{msg.sender === 'user' ? 'You' : 'AI Interviewer'}:</strong>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your response or click the mic..." : "Connecting..."}
            disabled={!isConnected || isEnded}
            rows="3"
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected || isEnded}
              className="btn"
              style={{
                background: isRecording ? '#f44336' : '#4caf50',
                color: 'white',
                width: 'auto',
                padding: '12px 20px'
              }}
            >
              {isRecording ? '⏹️ Stop' : '🎤 Speak'}
            </button>

            <button
              onClick={sendMessage}
              disabled={!isConnected || isEnded || !inputMessage.trim()}
              className="btn btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewRoom;