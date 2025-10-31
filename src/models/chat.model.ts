import { GroundingSupport } from '@google/genai';

export type MessageRole = 'user' | 'model' | 'tool';

export interface GroundingChunk {
  uri: string;
  title: string;
}

export interface ChatMessage {
  role: MessageRole;
  content: string;
  searchEntryPoint?: string; // HTML content
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
}
