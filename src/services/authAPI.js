
import api from './axiosConfig';

const authAPI = {
  signUp: async (data) => {
    try {
      console.log('Signup request data:', data);

      const response = await api.post('/auth/signup', {
        firstName: data.firstName,
        lastName: data.lastName || '',
        email: data.email,
        password: data.password
      });

      console.log('Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  signIn: async (data) => {
    try {
      console.log('SignIn request data:', data);

      // Try /signin first (main endpoint)
      const response = await api.post('/auth/signin', data);
      console.log('SignIn response:', response.data);

      if (response.data.success) {
        // Store user data
        if (response.data.userId) {
          localStorage.setItem('userId', response.data.userId);
        }
        if (response.data.email) {
          localStorage.setItem('userEmail', response.data.email);
        }
        if (response.data.firstName && response.data.lastName) {
          localStorage.setItem('userName', `${response.data.firstName} ${response.data.lastName}`);
        } else if (response.data.name) {
          localStorage.setItem('userName', response.data.name);
        }

        console.log('Stored in localStorage:', {
          userId: localStorage.getItem('userId'),
          userEmail: localStorage.getItem('userEmail'),
          userName: localStorage.getItem('userName')
        });
      }

      return response.data;
    } catch (error) {
      console.error('SignIn API error:', error);
      // If /signin fails, try /login as fallback
      if (error.response?.status === 404) {
        try {
          console.log('Trying /login endpoint as fallback...');
          const response = await api.post('/auth/login', data);

          if (response.data.success) {
            if (response.data.userId) {
              localStorage.setItem('userId', response.data.userId);
            }
            if (response.data.email) {
              localStorage.setItem('userEmail', response.data.email);
            }
            if (response.data.firstName && response.data.lastName) {
              localStorage.setItem('userName', `${response.data.firstName} ${response.data.lastName}`);
            }
          }

          return response.data;
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      throw error;
    }
  },

  signOut: () => {
    localStorage.clear();
    window.location.href = '/signin';
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('userId');
  },

  getCurrentUserId: () => {
    return localStorage.getItem('userId');
  }
};

export default authAPI;