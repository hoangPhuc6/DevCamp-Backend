import { Injectable } from '@angular/core';
import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Part,
} from '@google/genai';
import { functionDeclarations, toolImplementations } from './available-tools';
import { MessageRole } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private chat: Chat | null = null;
  private readonly ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: 'AIzaSyC-aBTOrJcVrW0OEsUPccR2RZgsCIZK5HU',
    });
  }

  private startChat(): void {
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        tools: [{ functionDeclarations }],
      },
    });
  }

  async sendMessage(
    prompt: string
  ): Promise<{ role: MessageRole; content: string }> {
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
  ): Promise<{
    role: MessageRole;
    content: string;
  }> {
    const functionCalls = response.candidates?.[0]?.content.parts
      .filter((part) => !!part.functionCall)
      .map((part) => part.functionCall);

    if (!functionCalls || functionCalls.length === 0) {
      return {
        role: isToolResponse ? 'tool' : 'model',
        content: response.text.trim(),
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
