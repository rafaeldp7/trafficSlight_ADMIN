// Custom hook for error handling
import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error('Error:', error);
    setError(error.message || 'An unexpected error occurred');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsyncError = useCallback(async (asyncFunction) => {
    try {
      clearError();
      return await asyncFunction();
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    handleAsyncError
  };
};
