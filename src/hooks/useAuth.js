// Custom hook for authentication
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Additional authentication hooks
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

export const useAuthActions = () => {
  const { login, register, logout, updateProfile, changePassword } = useAuth();
  return { login, register, logout, updateProfile, changePassword };
};

export const useAuthError = () => {
  const { error, clearError } = useAuth();
  return { error, clearError };
};
