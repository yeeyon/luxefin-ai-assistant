import { toError } from '../utils/api-error';

export interface AIAssistanceRequest {
  query: string;
  token: string;
}

export interface AIAssistanceSource {
  documentName: string;
  chunkId: string;
  score: number;
}

export interface AIAssistanceMetadata {
  matchType: string;
  confidence: number;
  processingTime: number;
}

export interface AIAssistanceResponse {
  success: boolean;
  response: string;
  sources: AIAssistanceSource[];
  metadata: AIAssistanceMetadata;
  language: string;
  userId: string;
  agentId: string;
  tenantId: string;
}

export interface SuggestedMessage {
  id: string;
  content: string;
  order_index: number;
}

export interface BrandingConfig {
  enabled: boolean;
  hideAllBranding: boolean;
}

export interface AvatarsConfig {
  user?: string;
  ai?: string;
}

export interface AIInitResponse {
  success: boolean;
  welcomeMessage: string;
  suggestedMessages: SuggestedMessage[];
  placeholder: string;
  avatars?: AvatarsConfig;
  branding: BrandingConfig;
}

const DEFAULT_AI_CHATBOT_URL = 'https://chatbot.therelah.com';

export class AIAssistanceService {
  private static readonly chatbotOrigin = (
    process.env.NEXT_PUBLIC_AI_CHATBOT_URL || DEFAULT_AI_CHATBOT_URL
  ).replace(/\/$/, '');

  private static readonly BASE_URL = `${AIAssistanceService.chatbotOrigin}/api/embed/api`;
  private static readonly INIT_URL = `${AIAssistanceService.chatbotOrigin}/api/embed/init`;

  static async fetchInit(
    embedToken: string,
    origin?: string
  ): Promise<AIInitResponse> {
    try {
      const headers: Record<string, string> = {};

      if (origin) {
        headers.Origin = origin;
      }

      const url = `${this.INIT_URL}?apiKey=${embedToken}`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'AI initialization request failed');
      }

      return data as AIInitResponse;
    } catch (error: unknown) {
      throw toError(error);
    }
  }

  static async sendQuery(
    query: string,
    embedToken: string,
    origin?: string
  ): Promise<AIAssistanceResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (origin) {
        headers.Origin = origin;
      }

      const requestBody: AIAssistanceRequest = {
        query,
        token: embedToken,
      };

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'AI assistance request failed');
      }

      return data as AIAssistanceResponse;
    } catch (error: unknown) {
      throw toError(error);
    }
  }

  static async sendQueryWithRetry(
    query: string,
    embedToken: string,
    origin?: string,
    maxRetries: number = 1
  ): Promise<AIAssistanceResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.sendQuery(query, embedToken, origin);
      } catch (error: unknown) {
        lastError = toError(error);

        if (lastError.message.includes('Rate limit exceeded') && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 60_000));
          continue;
        }

        break;
      }
    }

    throw lastError ?? new Error('AI assistance request failed');
  }

  static isValidTokenFormat(token: string): boolean {
    return typeof token === 'string' && token.length > 0 && token.trim().length > 0;
  }

  static isValidQuery(query: string): boolean {
    return typeof query === 'string' && query.trim().length > 0;
  }

  static isValidResponse(response: unknown): response is AIAssistanceResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      (response as AIAssistanceResponse).success === true &&
      typeof (response as AIAssistanceResponse).response === 'string' &&
      Array.isArray((response as AIAssistanceResponse).sources) &&
      typeof (response as AIAssistanceResponse).metadata === 'object'
    );
  }
}
