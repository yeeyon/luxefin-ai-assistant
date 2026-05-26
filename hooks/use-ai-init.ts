import { useState, useEffect, useRef, useCallback } from 'react';
import { AIAssistanceService, AIInitResponse, SuggestedMessage, AvatarsConfig } from '@/lib/services/ai-assistance';

export interface UseAIInitOptions {
  embedToken: string;
  chatbotUrl: string;
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

  const { embedToken, chatbotUrl, origin, onError, onSuccess } = options;

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;

  const fetchInitData = useCallback(async () => {
    if (!embedToken || !chatbotUrl) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await AIAssistanceService.fetchInit(embedToken, chatbotUrl, origin);

      setWelcomeMessage(response.welcomeMessage);
      setSuggestedMessages(
        response.suggestedMessages.sort((a, b) => a.order_index - b.order_index)
      );
      setPlaceholder(response.placeholder);
      setAvatars(response.avatars || null);

      onSuccessRef.current?.(response);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onErrorRef.current?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [embedToken, chatbotUrl, origin]);

  useEffect(() => {
    void fetchInitData();
  }, [fetchInitData]);

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
