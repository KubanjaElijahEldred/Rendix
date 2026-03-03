import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    const parsedToken = JSON.parse(token);
    if (parsedToken.state?.token) {
      config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
    }
  }
  return config;
});

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append('username', username);
          formData.append('password', password);

          const response = await api.post('/api/auth/login-form', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          const { access_token } = response.data;

          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

          // Get user info
          const userResponse = await api.get('/api/auth/me');
          
          set({
            user: userResponse.data,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Login failed';
          throw new Error(message);
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/register', userData);
          
          // Auto-login after registration
          await get().login(userData.username, userData.password);
          
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Registration failed';
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear token from api headers
          delete api.defaults.headers.common['Authorization'];
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      verifyAccount: async () => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/verify');
          
          // Update user verification status
          const { user } = get();
          if (user) {
            set({
              user: { ...user, is_verified: true },
              isLoading: false,
            });
          }
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Verification failed';
          throw new Error(message);
        }
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          return;
        }

        set({ isLoading: true });
        
        try {
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/api/auth/me');
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Update user profile
      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await api.put('/api/auth/me', profileData);
          
          set({
            user: response.data,
            isLoading: false,
          });
          
          return response.data;
        } catch (error) {
          set({ isLoading: false });
          const message = error.response?.data?.detail || 'Profile update failed';
          throw new Error(message);
        }
      },
    }),
    {
      name: 'rendix-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
