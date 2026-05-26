import { useState, useCallback } from 'react';
import { AIAssistanceService, AIAssistanceResponse } from '@/lib/services/ai-assistance';

export interface UseAIAssistanceOptions {
  embedToken: string;
  origin?: string;
  maxRetries?: number;
  onError?: (error: Error) => void;
  onSuccess?: (response: AIAssistanceResponse) => void;
}

export interface UseAIAssistanceReturn {
  sendQuery: (query: string) => Promise<AIAssistanceResponse | null>;
  isLoading: boolean;
  error: Error | null;
  lastResponse: AIAssistanceResponse | null;
  clearError: () => void;
  clearResponse: () => void;
}

export function useAIAssistance(options: UseAIAssistanceOptions): UseAIAssistanceReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResponse, setLastResponse] = useState<AIAssistanceResponse | null>(null);

  const {
    embedToken,
    origin,
    maxRetries = 1,
    onError,
    onSuccess,
  } = options;

  const sendQuery = useCallback(async (query: string): Promise<AIAssistanceResponse | null> => {
    setError(null);
    setIsLoading(true);

    try {
      if (!AIAssistanceService.isValidTokenFormat(embedToken)) {
        throw new Error('Invalid embed token format');
      }

      if (!AIAssistanceService.isValidQuery(query)) {
        throw new Error('Query cannot be empty');
      }

      const response = await AIAssistanceService.sendQueryWithRetry(
        query,
        embedToken,
        origin,
        maxRetries
      );

      if (!AIAssistanceService.isValidResponse(response)) {
        throw new Error('Invalid response format from AI assistance API');
      }

      setLastResponse(response);
      onSuccess?.(response);
      return response;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [embedToken, origin, maxRetries, onError, onSuccess]);

  const clearError = useCallback(() => setError(null), []);
  const clearResponse = useCallback(() => setLastResponse(null), []);

  return {
    sendQuery,
    isLoading,
    error,
    lastResponse,
    clearError,
    clearResponse,
  };
}
