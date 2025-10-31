import { Injectable } from '@angular/core';
import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Part,
} from '@google/genai';
import { functionDeclarations, toolImplementations } from './available-tools';
import { ChatMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private chat: Chat | null = null;
  private readonly ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: Replace with your API key
    this.ai = new GoogleGenAI({
      apiKey: 'YOUR_API_KEY_HERE', // 👈 Replace this!
    });
  }

  private startChat(): void {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
      },
    });
  }

  async sendMessage(prompt: string): Promise<ChatMessage> {
    if (!this.chat) {
      this.startChat();
    }

    if (!this.chat) {
      return {
        role: 'model',
        content: 'Chat could not be initialized.',
      };
    }

    const response: GenerateContentResponse = await this.chat.sendMessage({
      message: prompt,
    });
    return await this.handleResponse(response);
  }

  private async handleResponse(
    response: GenerateContentResponse,
    isToolResponse = false
  ): Promise<ChatMessage> {
    const functionCalls = response.candidates?.[0]?.content.parts
      .filter((part) => !!part.functionCall)
      .map((part) => part.functionCall);

    if (!functionCalls || functionCalls.length === 0) {
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      return {
        role: isToolResponse ? 'tool' : 'model',
        content: response.text.trim(),
        searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent,
        groundingChunks: groundingMetadata?.groundingChunks?.map((chunk) => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        })),
        groundingSupports: groundingMetadata?.groundingSupports,
      };
    }

    const toolResults: Part[] = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      const tool = toolImplementations[name];

      if (tool) {
        console.log(`Calling tool: ${name} with args:`, args);
        const result = await tool(...Object.values(args));
        toolResults.push({
          functionResponse: {
            name,
            response: result,
          },
        });
      } else {
        console.warn(`Unknown tool called: ${name}`);
      }
    }

    if (!this.chat) {
      return {
        role: 'model',
        content: 'Chat not initialized for sending tool response.',
      };
    }

    const toolResponse = await this.chat.sendMessage({ message: toolResults });
    return await this.handleResponse(toolResponse, true);
  }
}
