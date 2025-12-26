const WS_URL = 'ws://localhost:8080/ws/interview';

class SocketService {
  socket = null;
  messageHandlers = [];

  connect(interviewId) {
    return new Promise((resolve, reject) => {
      try {
        // Close existing connection if any
        if (this.socket) {
          this.socket.close();
        }

        this.socket = new WebSocket(WS_URL);

        this.socket.onopen = () => {
          console.log('WebSocket connected');

          // Send start message to your backend
          this.socket.send(JSON.stringify({
            type: 'start',
            interviewId: parseInt(interviewId)
          }));

          resolve(this.socket);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected', event.code);
        };

        // Set up message handler
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.messageHandlers = [];
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  onMessage(callback) {
    if (typeof callback === 'function') {
      this.messageHandlers.push(callback);
    }
  }

  offMessage(callback) {
    this.messageHandlers = this.messageHandlers.filter(handler => handler !== callback);
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Create instance and assign to variable before exporting
const socketService = new SocketService();

export default socketService;