
export type MessageRole = 'user' | 'model' | 'tool';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}
