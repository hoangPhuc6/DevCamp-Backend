# Codelab: Integrate Gemini API into Angular App

## 🎯 Overview

Welcome to this hands-on codelab! You'll learn how to integrate Google's Gemini API into an Angular application to build an intelligent chatbot with function calling capabilities.

**Duration**: 45-60 minutes  
**Level**: Intermediate  
**Technologies**: Angular 20, Gemini API, TypeScript, TailwindCSS

### What You'll Build

A real-time chatbot application that:

- ✨ Communicates with Google's Gemini AI model
- 🛠️ Uses function calling to execute custom tools
- 🌐 Performs grounded searches with web results
- 💬 Displays chat messages with a modern UI

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** (v22 or later) installed
- **npm** or **yarn** package manager
- Basic knowledge of **Angular** and **TypeScript**
- A **Google AI Studio account** and **Gemini API key**

---

## 🚀 Part 1: Setup the Project

### Step 1: Clone or Download the Project

```bash
# Clone the repository (or download the project files)
cd gdg-angular
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- Angular 20 framework
- `@google/genai` - Gemini API client library
- TailwindCSS for styling
- Other required dependencies

### Step 3: Get Your Gemini API Key

🔑 **TODO**: You need to obtain your own API key!

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key (keep it secure!)

> ⚠️ **Important**: Never commit API keys to version control. We'll configure it properly in the next steps.

### Step 4: Configure Your API Key

Open `src/services/gemini.service.ts` and locate the constructor:

```typescript
constructor() {
  // IMPORTANT: Replace with your API key
  this.ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY_HERE', // 👈 Replace this!
  });
}
```

**TODO**: Replace `'YOUR_API_KEY_HERE'` with your actual Gemini API key.

> 💡 **Best Practice**: For production apps, use environment variables instead of hardcoded keys. We'll discuss this later!

---

## 🧠 Part 2: Understanding the Gemini Integration

### Architecture Overview

```
┌─────────────────┐
│ AppComponent    │ ← User Interface (Chat UI)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ GeminiService   │ ← Handles AI Communication
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Gemini API      │ ← Google's AI Model
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Function Tools  │ ← Custom Functions (Weather, Orders)
└─────────────────┘
```

### Key Files to Understand

| File                              | Purpose                                   |
| --------------------------------- | ----------------------------------------- |
| `src/services/gemini.service.ts`  | Core service for Gemini API integration   |
| `src/services/available-tools.ts` | Function declarations and implementations |
| `src/models/chat.model.ts`        | Type definitions for chat messages        |
| `src/app.component.ts`            | Main chat interface component             |
| `src/components/chat-message/`    | Individual message display component      |

---

## 💻 Part 3: Exploring the Gemini Service

Open `src/services/gemini.service.ts` and let's understand the key parts:

### 3.1 Initializing the Gemini Client

```typescript
constructor() {
  this.ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
  });
}
```

The `GoogleGenAI` class is the main entry point for interacting with Gemini.

### 3.2 Starting a Chat Session

```typescript
private startChat(): void {
  this.chat = this.ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      tools: [{ urlContext: {} }, { googleSearch: {} }],
    },
  });
}
```

**Key Concepts**:

- **Model**: We're using `gemini-2.5-flash` (fast and efficient)
- **Tools**: Enable `urlContext` and `googleSearch` for grounded responses

**🎯 TASK**: Try changing the model to `gemini-2.5-pro` to see the difference in responses!

### 3.3 Sending Messages

```typescript
async sendMessage(prompt: string): Promise<ChatMessage> {
  if (!this.chat) {
    this.startChat();
  }

  const response: GenerateContentResponse = await this.chat.sendMessage({
    message: prompt,
  });

  return await this.handleResponse(response);
}
```

This method:

1. Ensures a chat session exists
2. Sends the user's message
3. Processes the response

### 3.4 Handling Responses with Function Calling

The `handleResponse` method is where the magic happens:

```typescript
private async handleResponse(
  response: GenerateContentResponse,
  isToolResponse = false
): Promise<ChatMessage> {
  // Check if Gemini wants to call a function
  const functionCalls = response.candidates?.[0]?.content.parts
    .filter((part) => !!part.functionCall)
    .map((part) => part.functionCall);

  if (!functionCalls || functionCalls.length === 0) {
    // No function call - return the text response
    return {
      role: isToolResponse ? 'tool' : 'model',
      content: response.text.trim(),
      // Include grounding metadata if available
      searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent,
      groundingChunks: groundingMetadata?.groundingChunks?.map(...),
    };
  }

  // Execute the function calls
  const toolResults: Part[] = [];
  for (const call of functionCalls) {
    const { name, args } = call;
    const tool = toolImplementations[name];

    if (tool) {
      const result = await tool(...Object.values(args));
      toolResults.push({
        functionResponse: { name, response: result }
      });
    }
  }

  // Send tool results back to Gemini
  const toolResponse = await this.chat.sendMessage({ message: toolResults });
  return await this.handleResponse(toolResponse, true);
}
```

**Flow Explanation**:

1. Check if Gemini requests a function call
2. If yes → Execute the function and send results back
3. If no → Return the text response with grounding data

---

## 🛠️ Part 4: Working with Function Calling

Open `src/services/available-tools.ts` to see how custom functions are defined.

### 4.1 Function Implementations

```typescript
function getWeather(location: string): object {
  if (location.toLowerCase().includes('tokyo')) {
    return { location: 'Tokyo', temperature: '15°C', condition: 'Cloudy' };
  }
  // ... more locations
  return { location, temperature: '20°C', condition: 'Clear' };
}

function getOrderStatus(orderId: string): object {
  const orderIdNumber = parseInt(orderId, 10);
  if (orderIdNumber > 500) {
    return { orderId, status: 'Shipped' };
  }
  return { orderId, status: 'Processing' };
}
```

These are **mock functions** for demonstration. In a real app, these would call actual APIs!

### 4.2 Function Declarations

```typescript
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getWeather',
    description: 'Get the current weather in a given location',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: 'The city and state, e.g. San Francisco, CA',
        },
      },
      required: ['location'],
    },
  },
  // ... more functions
];
```

**Important**: The `description` field is crucial! Gemini uses it to decide when to call your function.

### 4.3 Tool Mapping

```typescript
export const toolImplementations: { [key: string]: (...args: any[]) => any } = {
  getWeather,
  getOrderStatus,
};
```

This maps function names to their implementations.

---

## 🎨 Part 5: Build Your Own Custom Tool

Now it's your turn! Let's add a new function to get stock prices.

### 5.1 Add Function Implementation

**TODO**: Add this function to `src/services/available-tools.ts`:

```typescript
function getStockPrice(symbol: string): object {
  // Mock stock prices
  const stocks: {
    [key: string]: { symbol: string; price: string; change: string };
  } = {
    GOOGL: { symbol: 'GOOGL', price: '$175.50', change: '+2.3%' },
    AAPL: { symbol: 'AAPL', price: '$189.25', change: '+1.8%' },
    MSFT: { symbol: 'MSFT', price: '$420.10', change: '+0.5%' },
  };

  const upperSymbol = symbol.toUpperCase();
  return (
    stocks[upperSymbol] || {
      symbol: upperSymbol,
      price: 'N/A',
      change: 'N/A',
      error: 'Stock not found',
    }
  );
}
```

### 5.2 Add to Tool Implementations

**TODO**: Update the `toolImplementations` object:

```typescript
export const toolImplementations: { [key: string]: (...args: any[]) => any } = {
  getWeather,
  getOrderStatus,
  getStockPrice, // 👈 Add this line!
};
```

### 5.3 Add Function Declaration

**TODO**: Add this to the `functionDeclarations` array:

```typescript
{
  name: "getStockPrice",
  description: "Get the current stock price for a given ticker symbol",
  parameters: {
    type: Type.OBJECT,
    properties: {
      symbol: {
        type: Type.STRING,
        description: "The stock ticker symbol, e.g. GOOGL, AAPL, MSFT",
      },
    },
    required: ["symbol"],
  },
}
```

### 5.4 Update the Service to Use Function Declarations

**TODO**: Modify `src/services/gemini.service.ts` in the `startChat()` method:

```typescript
private startChat(): void {
  this.chat = this.ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      tools: [
        { functionDeclarations }, // 👈 Add this line!
        { urlContext: {} },
        { googleSearch: {} }
      ],
    },
  });
}
```

Make sure to import at the top:

```typescript
import { functionDeclarations, toolImplementations } from './available-tools';
```

---

## 🧪 Part 6: Testing Your Chatbot

### Step 1: Start the Development Server

```bash
npm run dev
```

The app should open at `http://localhost:4200` (or the port shown in terminal).

### Step 2: Test Built-in Functions

Try these prompts:

1. **Weather**: "What's the weather in Tokyo?"
2. **Orders**: "Check status for order 501"
3. **Search**: "Who won the Nobel Prize in Physics in 2023?"

### Step 3: Test Your Custom Stock Function

Try: "What's the stock price for GOOGL?"

**Expected behavior**:

- Gemini recognizes it needs stock info
- Calls `getStockPrice("GOOGL")`
- Returns formatted response with the price

### Step 4: Debugging Function Calls

Open the browser console (F12) and look for logs:

```
Calling tool: getStockPrice with args: { symbol: "GOOGL" }
```

This confirms your function is being called correctly!

---

## 🎓 Part 7: Understanding Grounding & Search

### What is Grounding?

Grounding connects AI responses to real-world sources, making them more accurate and trustworthy.

### How It Works in the Code

In `src/services/gemini.service.ts`:

```typescript
const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

return {
  role: 'model',
  content: response.text.trim(),
  searchEntryPoint: groundingMetadata?.searchEntryPoint?.renderedContent,
  groundingChunks: groundingMetadata?.groundingChunks?.map((chunk) => ({
    uri: chunk.web.uri,
    title: chunk.web.title,
  })),
  groundingSupports: groundingMetadata?.groundingSupports,
};
```

### Display in the UI

The `ChatMessageComponent` processes grounding data and adds citation links:

```typescript
processedContent = computed(() => {
  const message = this.message();
  if (!message.groundingSupports || !message.groundingChunks) {
    return message.content;
  }

  // Add [1], [2] citation links to the content
  let content = message.content;
  for (const support of message.groundingSupports) {
    const links = support.groundingChunkIndices
      .map((index) => {
        const chunk = message.groundingChunks![index];
        return `<a href="${chunk.uri}" target="_blank">[${index + 1}]</a>`;
      })
      .join('');
    // Insert links at the appropriate position
  }

  return content;
});
```

**Try it**: Ask "What are the latest AI developments?" and see citation links appear!

---

## 🔒 Part 8: Best Practices & Security

### 8.1 Securing Your API Key

**❌ DON'T** hardcode API keys in your source code!

**✅ DO** use environment variables:

1. Create a `.env.local` file:

   ```
   VITE_GEMINI_API_KEY=your_actual_key_here
   ```

2. Add `.env.local` to `.gitignore`:

   ```
   .env.local
   ```

3. Update `gemini.service.ts`:
   ```typescript
   constructor() {
     this.ai = new GoogleGenAI({
       apiKey: import.meta.env.VITE_GEMINI_API_KEY,
     });
   }
   ```

### 8.2 Rate Limiting & Error Handling

**TODO**: Add error handling to your service:

```typescript
async sendMessage(prompt: string): Promise<ChatMessage> {
  try {
    if (!this.chat) {
      this.startChat();
    }

    const response = await this.chat!.sendMessage({ message: prompt });
    return await this.handleResponse(response);
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      role: 'model',
      content: 'Sorry, I encountered an error. Please try again.',
    };
  }
}
```

### 8.3 Model Selection

| Model                  | Use Case                  | Speed  | Quality    |
| ---------------------- | ------------------------- | ------ | ---------- |
| `gemini-2.5-flash`     | Fast responses, chat apps | ⚡⚡⚡ | ⭐⭐⭐     |
| `gemini-2.5-pro`       | Complex tasks, analysis   | ⚡⚡   | ⭐⭐⭐⭐⭐ |
| `gemini-2.0-flash-exp` | Experimental features     | ⚡⚡⚡ | ⭐⭐⭐⭐   |

---

## 🎯 Part 9: Challenges & Extensions

Ready to level up? Try these challenges:

### Challenge 1: Add More Tools

Create functions for:

- Currency conversion
- Unit conversion (miles to km)
- Date/time in different timezones

### Challenge 2: Streaming Responses

Implement streaming to show responses as they're generated (typewriter effect).

**Hint**: Use `streamGenerateContent()` instead of `generateContent()`.

### Challenge 3: Conversation History

Save chat history to localStorage and restore on page reload.

### Challenge 4: Multi-Modal Input

Allow users to upload images and ask questions about them.

**Hint**: Use `GoogleGenAI.models.generateContent()` with image parts.

### Challenge 5: System Instructions

Add custom system instructions to control the AI's personality and behavior.

```typescript
this.chat = this.ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: 'You are a helpful assistant specialized in...',
    tools: [...]
  },
});
```

---

## 📚 Additional Resources

### Official Documentation

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)
- [Grounding with Google Search](https://ai.google.dev/docs/grounding)
- [Angular Documentation](https://angular.dev)

### Code Examples

- [Gemini API Cookbook](https://github.com/google-gemini/cookbook)
- [Angular Examples](https://angular.dev/examples)

### Community

- [Google AI Studio](https://aistudio.google.com)
- [Stack Overflow - gemini-api tag](https://stackoverflow.com/questions/tagged/gemini-api)

---

## 🎉 Conclusion

Congratulations! You've successfully:

✅ Integrated Gemini API into an Angular application  
✅ Implemented function calling with custom tools  
✅ Built a real-time chat interface  
✅ Understood grounding and search capabilities  
✅ Created your own custom AI-powered tool

### What's Next?

- Build a production-ready chatbot for your website
- Integrate with your existing APIs and databases
- Explore multimodal capabilities (images, audio, video)
- Experiment with different Gemini models
- Deploy your app to production

---

## 🐛 Troubleshooting

### Issue: "API Key Invalid"

**Solution**: Double-check your API key in `gemini.service.ts`. Make sure there are no extra spaces.

### Issue: Functions Not Being Called

**Solution**:

1. Verify function declarations match implementation names
2. Check that descriptions are clear and specific
3. Ensure `functionDeclarations` is imported in the service

### Issue: CORS Errors

**Solution**: The Gemini API should handle CORS automatically. If issues persist, check your API key permissions.

### Issue: Slow Responses

**Solution**:

1. Use `gemini-2.5-flash` instead of `pro` for faster responses
2. Reduce the complexity of your prompts
3. Check your internet connection

---

## 📝 Feedback

Found an issue or have suggestions? Please let us know!

**Happy Coding! 🚀**

---

_Last Updated: October 29, 2025_  
_Codelab Version: 1.0_
