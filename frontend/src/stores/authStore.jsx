
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api.jsx';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      authMethods: null,
      isAuthenticated: false,
      isLoading: true,

      login: (userData) => {
        set({ user: userData, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        try {
          await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/signout`, {
            method: 'POST',
            credentials: 'include',
          });
        }
        catch (error) {
          console.error('Error in logout:', error);
        }
        finally {
          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      hasLocalAuth: () => {
        const { authMethods } = get();
        return authMethods?.some(method => method.provider === 'local') ?? false;
      },

      checkAuthStatus: async () => {
        try {
          set({ isLoading: true });

          const currentState = get();

          if (currentState.user && currentState.isAuthenticated) {
            try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify`, {
                method: 'GET',
                credentials: 'include', // This will send the HttpOnly cookie
                headers: {
                  'Content-Type': 'application/json',
                }
              });

              if (response.ok) {
                set({
                  isAuthenticated: true,
                  isLoading: false
                });
                return;
              } else {
                console.log('User is not authenticated with the server');
              }
            } catch (error) {
              console.log('Error in checking auth with server');
            }
          }
          // No user data or server verification failed
          console.log('No valid authentication, clearing auth state');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      updateUserInStore: (updatedUserData) => {
        const { user } = get();
        set({
          user: { ...user, ...updatedUserData }
        });
      },

      refreshUserData: async () => {
        try {
          // Use the authApi instead of direct fetch for consistency
          const userData = await authApi.getCurrentUser();
          console.log('Fetched user data:', userData);

          // Also fetch auth methods if the API exists
          let authMethodsData = null;
          try {
            if (authApi.getUserAuthMethods) {
              authMethodsData = await authApi.getUserAuthMethods();
              console.log('Fetched auth methods:', authMethodsData);
            }
          } catch (authMethodError) {
            console.log('Auth methods not available or failed:', authMethodError);
          }

          if (userData.data?.user) {
            set({
              user: userData.data.user,
              authMethods: authMethodsData?.authMethods || get().authMethods || [],
              isAuthenticated: true,
              isLoading: false
            });
          } else if (userData.user) {
            set({
              user: userData.user,
              authMethods: authMethodsData?.authMethods || get().authMethods || [],
              isAuthenticated: true,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
          // Try fallback to verify endpoint if getCurrentUser fails
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/verify`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('Verify endpoint data:', verifyData);
              if (verifyData.data?.user) {
                set({
                  user: verifyData.data.user,
                  authMethods: get().authMethods || [],
                  isAuthenticated: true,
                  isLoading: false
                });
              }
            }
          } catch (fallbackError) {
            console.error('Fallback verify endpoint also failed:', fallbackError);
          }
        }
      },
      deleteUser: async () => {
        const { user } = get();
        if (!user || !user.id) {
          throw new Error('No user ID found for deletion');
        }
        try {
          await authApi.deleteUser(user.id);
          set({ user: null, authMethods: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          console.error('Error deleting user:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authMethods: state.authMethods,
        isAuthenticated: state.isAuthenticated,
        isLoading: false
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated from localStorage:', state);
        // Ensure authMethods is initialized if not present
        if (state && !state.authMethods) {
          state.authMethods = null;
        }
        // After rehydration, we'll check auth status in checkAuthStatus
      },
    }
  )
);
