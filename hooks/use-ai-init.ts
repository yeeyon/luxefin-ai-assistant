import { useState, useEffect, useCallback } from 'react';
import { AIAssistanceService, AIInitResponse, SuggestedMessage, AvatarsConfig } from '@/lib/services/ai-assistance';

export interface UseAIInitOptions {
  embedToken: string;
  origin?: string;
  onError?: (error: Error) => void;
  onSuccess?: (response: AIInitResponse) => void;
}

export interface UseAIInitReturn {
  welcomeMessage: string | null;
  suggestedMessages: SuggestedMessage[];
  placeholder: string | null;
  avatars: AvatarsConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAIInit(options: UseAIInitOptions): UseAIInitReturn {
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<SuggestedMessage[]>([]);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [avatars, setAvatars] = useState<AvatarsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { embedToken, origin, onError, onSuccess } = options;

  const fetchInitData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AIAssistanceService.fetchInit(embedToken, origin);

      setWelcomeMessage(response.welcomeMessage);
      setSuggestedMessages(
        response.suggestedMessages.sort((a, b) => a.order_index - b.order_index)
      );
      setPlaceholder(response.placeholder);
      setAvatars(response.avatars || null);

      onSuccess?.(response);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [embedToken, origin, onError, onSuccess]);

  useEffect(() => {
    if (embedToken) {
      void fetchInitData();
    }
  }, [embedToken, fetchInitData]);

  return {
    welcomeMessage,
    suggestedMessages,
    placeholder,
    avatars,
    isLoading,
    error,
    refetch: fetchInitData,
  };
}
