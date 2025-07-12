import React, { useState, createContext, useContext } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
  location?: string;
  photoUrl?: string;
  isPublic: boolean;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isAdmin?: boolean;
  rating: number;
  ratingCount?: number;
  connectionCount?: number;
  isBanned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Helper function to make authenticated API calls
const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token on app load
  React.useEffect(() => {
    const savedToken = localStorage.getItem('skillswap_token');
    if (savedToken) {
      setAuthToken(savedToken);
      // Verify token and get user data
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await apiCall('/auth/verify_token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      
      if (response.success && response.user) {
        setCurrentUser(response.user);
        setAuthToken(token);
        localStorage.setItem('skillswap_token', token);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid token
      localStorage.removeItem('skillswap_token');
      setAuthToken(null);
      setCurrentUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // For demo purposes, use demo tokens based on email
      let token: string;
      
      if (email === 'jane@example.com') {
        token = 'demo-token-jane';
      } else if (email === 'john@example.com') {
        token = 'demo-token-john';
      } else if (email === 'admin@example.com') {
        token = 'demo-token-admin';
      } else {
        throw new Error('Invalid credentials. Use demo accounts: jane@example.com, john@example.com, or admin@example.com');
      }

      // Verify the token with our backend
      const response = await apiCall('/auth/verify_token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (response.success && response.user) {
        setCurrentUser(response.user);
        setAuthToken(token);
        localStorage.setItem('skillswap_token', token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (authToken) {
        await apiCall('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      setAuthToken(null);
      localStorage.removeItem('skillswap_token');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // For demo purposes, create a new demo token
      const demoToken = `demo-token-${name.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Create a new user profile
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        isPublic: false,
        skillsOffered: [],
        skillsWanted: [],
        availability: [],
        rating: 0,
        ratingCount: 0,
        connectionCount: 0,
        isAdmin: false,
        isBanned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // For demo purposes, we'll simulate a successful signup
      // In a real app, this would create the user in the backend
      setCurrentUser(newUser);
      setAuthToken(demoToken);
      localStorage.setItem('skillswap_token', demoToken);
      
      // You could also call the backend to create the user
      // await apiCall('/auth/signup', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password, name }),
      // });
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!authToken) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await authenticatedApiCall('/users/profile', authToken, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      setCurrentUser(response);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        signup,
        updateProfile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};