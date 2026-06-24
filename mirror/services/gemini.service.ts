import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Part,
  Type,
} from "@google/genai";
import { functionDeclarations, toolImplementations } from "./available-tools";
import { ChatMessage } from "../models/chat.model";

//Define rule for Agent "Thinking Mirror"
const DSA_SYSTEM_INSTRUCTION = `You are "Thinking Mirror" — a strict but encouraging DSA (Data Structures & Algorithms) mentor.

ABSOLUTE RULES — NEVER BREAK THESE:
1. NEVER write code solutions in any programming language, even if the user begs
2. NEVER provide complete implementations or pseudo-implementations
3. NEVER show code snippets that solve the problem
4. You MAY use simple pseudocode ONLY for explaining general patterns (e.g., "for each element, check if complement exists")
5. Always ask a probing question back BEFORE giving any hint
6. Guide through Socratic questioning — make the user THINK

YOUR APPROACH:
When a user describes a DSA problem:
- First, make sure you understand the problem. Ask clarifying questions if needed.
- Ask: "What's your first instinct? What data structure comes to mind?"
- Ask: "What would the brute force approach look like? What's its time complexity?"
- Ask: "Can you spot any repeated work or patterns?"

HINT ESCALATION (only after the user has genuinely attempted):
- Level 1 (Vague): "Think about what happens when you process elements in order..."
- Level 2 (Pattern): "This problem has a classic pattern — consider [pattern name]. Why might it help?"
- Level 3 (Key insight): "The key insight is [abstract concept]. How would you apply it to this specific problem?"

ENCOURAGEMENT:
- Celebrate when users have breakthroughs: "Exactly! You're on the right track!"
- When they're stuck, be empathetic: "This is a tricky one. Let's break it down smaller."
- Always remind them: thinking through it themselves builds real skill

FORMATTING:
- Use clear, concise language
- Use bullet points for multiple ideas
- Bold key concepts with **bold**
- Use emojis sparingly for engagement

Remember: Your job is to be a MIRROR — reflect the user's thinking back to them, help them see gaps, and guide them to the answer themselves.`;

class GeminiService {
  private chat: Chat | null = null;
  private readonly ai: GoogleGenAI;

  //Constructor define API Google GenAI
  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_APIKEY,
    });
  }

  private startChat(): void {
    this.chat = this.ai.chats.create({
      model: "gemini-2.5-flash", //define model API GEMINI
      config: {
        systemInstruction: DSA_SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations }],
        temperature: 0.3, // control model correct and serious answer
      },
    });
  }

  async sendMessage(prompt: string): Promise<ChatMessage> {
    if (!this.chat) {
      //If not create chat, call this function to create chat
      this.startChat();
    }

    if (!this.chat) {
      // If chat cannot create, return error message
      return { role: "model", content: "Chat could not be initialized." };
    }

    //GenerateContentResponse from API Google GenAI using prompt and send message to chat
    const response: GenerateContentResponse = await this.chat.sendMessage({
      message: prompt,
    });
    return await this.handleResponse(response);
  }

  //HandleResponse from API Google GenAI
  private async handleResponse(
    response: GenerateContentResponse,
    isToolResponse = false,
  ): Promise<ChatMessage> {
    const functionCalls = response.candidates?.[0]?.content?.parts
      ?.filter((part) => !!part.functionCall)
      .map((part) => part.functionCall);

    if (!functionCalls || functionCalls.length === 0) {
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

      return {
        role: isToolResponse ? "tool" : "model",
        content: (response.text ?? "").trim(),
        searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent,
        groundingChunks: groundingMetadata?.groundingChunks?.map(
          (chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
          }),
        ),
        groundingSupports: groundingMetadata?.groundingSupports,
      };
    }

    const toolResults: Part[] = [];

    for (const call of functionCalls) {
      const { name, args } = call!;
      const tool = toolImplementations[name!];

      if (tool) {
        console.log(`Calling tool: ${name} with args:`, args);
        const result = await tool(...Object.values(args!));
        toolResults.push({
          functionResponse: {
            name: name!,
            response: result,
          },
        });
      } else {
        console.warn(`Unknown tool called: ${name}`);
      }
    }

    if (!this.chat) {
      return {
        role: "model",
        content: "Chat not initialized for sending tool response.",
      };
    }

    const toolResponse = await this.chat.sendMessage({ message: toolResults });
    return await this.handleResponse(toolResponse, true);
  }

  async generateMonthlyReport(month: string, sessions: any[]): Promise<any> {
    const prompt = `You are a professional Socratic DSA mentor. Analyze the following DSA study sessions for the month of ${month} and generate a structured learning report.

Sessions:
${JSON.stringify(sessions, null, 2)}

Provide a summary of their performance, key strengths identified, and specific areas/weaknesses that need improvement.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            month: { type: Type.STRING },
            summary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["month", "summary", "strengths", "weaknesses"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Failed to generate monthly report: Empty response from AI.");
    }
    return JSON.parse(response.text);
  }

  async generateRoadmap(
    targetGoal: string,
    weaknesses: string[],
    strengths: string[]
  ): Promise<any> {
    const prompt = `Create a structured study roadmap to achieve the goal: "${targetGoal}".
The user has the following strengths and weaknesses in DSA:
Strengths:
${strengths.map((s) => `- ${s}`).join("\n")}
Weaknesses:
${weaknesses.map((w) => `- ${w}`).join("\n")}

Generate a phased learning plan. Each phase must include specific actionable tasks with estimated hours to complete. Ensure all tasks have a boolean 'isCompleted' set to false initially.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetGoal: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        estimatedHours: { type: Type.NUMBER },
                        isCompleted: { type: Type.BOOLEAN },
                      },
                      required: ["id", "title", "estimatedHours", "isCompleted"],
                    },
                  },
                },
                required: ["id", "title", "duration", "tasks"],
              },
            },
          },
          required: ["targetGoal", "phases"],
        },
      },
    });

    if (!response.text) {
      throw new Error("Failed to generate study roadmap: Empty response from AI.");
    }
    return JSON.parse(response.text);
  }
}

export const geminiService = new GeminiService();
