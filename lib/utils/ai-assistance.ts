import { AIAssistanceService, AIAssistanceResponse } from '../services/ai-assistance';

export interface AIAssistanceConfig {
  embedToken: string;
  origin?: string;
  maxRetries?: number;
}

export function getAIAssistanceConfig(): AIAssistanceConfig | null {
  const embedToken = process.env.NEXT_PUBLIC_AI_EMBED_TOKEN;
  const origin =
    process.env.NEXT_PUBLIC_AI_ORIGIN ||
    (typeof window !== 'undefined' ? window.location.origin : undefined);

  if (!embedToken) {
    if (typeof window !== 'undefined') {
      console.warn('AI Assistance: NEXT_PUBLIC_AI_EMBED_TOKEN not configured');
    }
    return null;
  }

  return {
    embedToken,
    origin,
    maxRetries: 1,
  };
}

export async function sendAIQuery(
  query: string,
  config?: Partial<AIAssistanceConfig>
): Promise<AIAssistanceResponse | null> {
  const defaultConfig = getAIAssistanceConfig();

  if (!defaultConfig) {
    throw new Error(
      'AI assistance is not properly configured. Please set NEXT_PUBLIC_AI_EMBED_TOKEN.'
    );
  }

  const finalConfig = { ...defaultConfig, ...config };

  try {
    return await AIAssistanceService.sendQueryWithRetry(
      query,
      finalConfig.embedToken,
      finalConfig.origin,
      finalConfig.maxRetries
    );
  } catch (error) {
    console.error('AI Assistance query failed:', error);
    return null;
  }
}

export async function testAIAssistance(): Promise<boolean> {
  const config = getAIAssistanceConfig();

  if (!config) {
    return false;
  }

  try {
    await AIAssistanceService.sendQuery(
      'Hello, this is a test query.',
      config.embedToken,
      config.origin
    );
    return true;
  } catch {
    return false;
  }
}
