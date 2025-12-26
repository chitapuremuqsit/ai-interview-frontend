const API_BASE_URL = 'http://localhost:8080/api';

const interviewAPI = {
  // Test connection
  testConnection: async () => {
    try {
      console.log('Testing connection to:', `${API_BASE_URL}/interviews/test`);
      const response = await fetch(`${API_BASE_URL}/interviews/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Connection test result:', response.ok, response.status);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },

  // Create Interview
  createInterview: async (interviewData) => {
    const userId = localStorage.getItem('userId');

    console.log('=== CREATE INTERVIEW DEBUG ===');
    console.log('API Base URL:', API_BASE_URL);
    console.log('User ID:', userId);
    console.log('Interview Data:', interviewData);

    if (!userId) {
      throw new Error('User not logged in. Please sign in again.');
    }

    const payload = {
      ...interviewData,
      userId: parseInt(userId),
    };

    console.log('Request Payload:', payload);
    console.log('Request URL:', `${API_BASE_URL}/interviews`);

    try {
      const response = await fetch(`${API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);

      // Try to get response text first
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      // Parse JSON
      const data = JSON.parse(responseText);
      console.log('Parsed Response Data:', data);

      return data;
    } catch (error) {
      console.error('=== CREATE INTERVIEW ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      throw error;
    }
  },

  getAllInterviews: async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/interviews/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch interviews: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getAllInterviews:', error);
      throw error;
    }
  },

  startInterview: async (interviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to start interview: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in startInterview:', error);
      throw error;
    }
  },

  endInterview: async (interviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to end interview: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in endInterview:', error);
      throw error;
    }
  },

  getResult: async (interviewId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}/result`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get result: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error in getResult:', error);
      throw error;
    }
  },
};

export default interviewAPI;