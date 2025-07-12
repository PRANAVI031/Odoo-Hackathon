import React, { useState, createContext, useContext, useEffect } from 'react';
import { User } from './AuthContext';

export type SwapRequest = {
  id: string;
  requesterId: string;
  requesterName: string;
  providerId: string;
  providerName: string;
  skillRequested: string;
  skillOffered: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string;
  createdAt: string;
  updatedAt?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
};

type SwapContextType = {
  swapRequests: SwapRequest[];
  createSwapRequest: (request: Omit<SwapRequest, 'id' | 'createdAt' | 'status' | 'updatedAt'>) => Promise<void>;
  updateSwapStatus: (id: string, status: SwapRequest['status']) => Promise<void>;
  deleteSwapRequest: (id: string) => Promise<void>;
  addFeedback: (id: string, rating: number, comment: string) => Promise<void>;
  getRequestsForUser: (userId: string) => SwapRequest[];
  isLoading: boolean;
  refreshSwaps: () => Promise<void>;
};

const SwapContext = createContext<SwapContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make authenticated API calls
const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
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

export const SwapProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('skillswap_token');
  };

  // Load swaps on mount and when user changes
  const refreshSwaps = async () => {
    const token = getAuthToken();
    if (!token) {
      setSwapRequests([]);
      return;
    }

    setIsLoading(true);
    try {
      const swaps = await authenticatedApiCall('/swaps', token, {
        method: 'GET',
      });
      setSwapRequests(swaps);
    } catch (error) {
      console.error('Failed to load swaps:', error);
      setSwapRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load swaps when component mounts
  useEffect(() => {
    refreshSwaps();
  }, []);

  const createSwapRequest = async (request: Omit<SwapRequest, 'id' | 'createdAt' | 'status' | 'updatedAt'>) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const newSwap = await authenticatedApiCall('/swaps', token, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      setSwapRequests(prev => [...prev, newSwap]);
    } catch (error) {
      console.error('Failed to create swap request:', error);
      throw error;
    }
  };

  const updateSwapStatus = async (id: string, status: SwapRequest['status']) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const updatedSwap = await authenticatedApiCall(`/swaps/${id}/status`, token, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      setSwapRequests(prev => 
        prev.map(req => req.id === id ? updatedSwap : req)
      );
    } catch (error) {
      console.error('Failed to update swap status:', error);
      throw error;
    }
  };

  const deleteSwapRequest = async (id: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      await authenticatedApiCall(`/swaps/${id}`, token, {
        method: 'DELETE',
      });

      setSwapRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error('Failed to delete swap request:', error);
      throw error;
    }
  };

  const addFeedback = async (id: string, rating: number, comment: string) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      await authenticatedApiCall(`/swaps/${id}/feedback`, token, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      });

      // Update the swap with feedback
      setSwapRequests(prev => 
        prev.map(req => req.id === id ? {
          ...req,
          feedback: { rating, comment }
        } : req)
      );
    } catch (error) {
      console.error('Failed to add feedback:', error);
      throw error;
    }
  };

  const getRequestsForUser = (userId: string) => {
    return swapRequests.filter(req => 
      req.requesterId === userId || req.providerId === userId
    );
  };

  return (
    <SwapContext.Provider
      value={{
        swapRequests,
        createSwapRequest,
        updateSwapStatus,
        deleteSwapRequest,
        addFeedback,
        getRequestsForUser,
        isLoading,
        refreshSwaps,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (context === undefined) {
    throw new Error('useSwap must be used within a SwapProvider');
  }
  return context;
};