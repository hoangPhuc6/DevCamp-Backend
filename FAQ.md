# ❓ Frequently Asked Questions (FAQ)

Common questions and answers about the Gemini Angular Codelab.

---

## 🚀 Getting Started

### Q: What if I don't have Node.js installed?

**A:** Download and install Node.js from [nodejs.org](https://nodejs.org). We recommend the LTS (Long Term Support) version. After installation, verify with:

```bash
node --version
npm --version
```

### Q: Can I use Yarn or pnpm instead of npm?

**A:** Yes! The project works with any package manager:

```bash
# Yarn
yarn install
yarn dev

# pnpm
pnpm install
pnpm dev
```

### Q: What if port 4200 is already in use?

**A:** Run on a different port:

```bash
npm run dev -- --port 4201
```

### Q: Do I need an Angular background?

**A:** Basic Angular knowledge helps, but we explain key concepts. Familiarity with TypeScript and components is beneficial.

---

## 🔑 API Keys & Authentication

### Q: Is the Gemini API free?

**A:** Yes! Gemini API has a generous free tier:

- 1,500 requests per day (RPD)
- 1 million tokens per minute (TPM)
- Perfect for learning and development

See [pricing details](https://ai.google.dev/pricing) for paid tiers.

### Q: Can I use the same API key for production?

**A:** For production, create a separate API key and:

- Use Google Cloud project API keys
- Implement proper rate limiting
- Monitor usage quotas
- Set up billing alerts

### Q: How do I secure my API key?

**A:** Best practices:

1. **Never commit to Git:**

   ```bash
   # Add to .gitignore
   .env.local
   .env
   ```

2. **Use environment variables:**

   ```typescript
   apiKey: import.meta.env.VITE_GEMINI_API_KEY;
   ```

3. **For production, use backend proxy:**
   - Keep keys server-side
   - Frontend calls your backend
   - Backend calls Gemini API

### Q: What if my API key doesn't work?

**A:** Check these:

- ✅ No extra spaces or quotes
- ✅ Key is enabled in AI Studio
- ✅ Haven't exceeded quota
- ✅ Correct key permissions
- Try generating a new key

### Q: Can I rotate API keys without downtime?

**A:** Yes! Create a new key, update your config, test, then revoke the old key.

---

## 🛠️ Function Calling

### Q: Why isn't my function being called?

**A:** Common causes:

1. **Description not clear enough:**

   ```typescript
   // ❌ Too vague
   description: 'Gets data';

   // ✅ Specific
   description: 'Get current weather for a specific city or location';
   ```

2. **Function name mismatch:**

   ```typescript
   // Must match exactly
   functionDeclarations: [{ name: "getWeather", ... }]
   toolImplementations: { getWeather: getWeather }
   ```

3. **Not included in tools config:**

   ```typescript
   tools: [
     { functionDeclarations }, // Make sure this is here!
     { googleSearch: {} },
   ];
   ```

4. **Prompt not specific enough:**
   ```
   ❌ "Tokyo weather"
   ✅ "What's the weather in Tokyo?"
   ```

### Q: Can functions call other functions?

**A:** Not directly through Gemini. But your implementation can:

```typescript
function complexTask(input: string) {
  const data = helperFunction1(input);
  const result = helperFunction2(data);
  return result;
}
```

### Q: How do I pass complex objects as parameters?

**A:** Define the structure in parameters:

```typescript
parameters: {
  type: Type.OBJECT,
  properties: {
    location: {
      type: Type.OBJECT,
      properties: {
        city: { type: Type.STRING },
        country: { type: Type.STRING }
      }
    }
  }
}
```

### Q: Can I make actual API calls in my functions?

**A:** Absolutely! Example:

```typescript
async function getRealWeather(location: string): Promise<object> {
  const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`
  );
  return await response.json();
}
```

Don't forget to make the function async and handle errors!

### Q: How many functions can I define?

**A:** No hard limit, but keep it reasonable (5-20 is typical). Too many functions can:

- Increase latency
- Confuse the model
- Use more tokens

### Q: Can I disable function calling temporarily?

**A:** Yes, omit `functionDeclarations` from tools:

```typescript
tools: [
  // { functionDeclarations }, // Commented out
  { googleSearch: {} },
];
```

---

## 🧠 Model & Configuration

### Q: Which Gemini model should I use?

**A:** It depends on your needs:

| Model                  | Best For             | Speed  | Cost |
| ---------------------- | -------------------- | ------ | ---- |
| `gemini-2.5-flash`     | Chat, real-time apps | ⚡⚡⚡ | $    |
| `gemini-2.5-pro`       | Complex reasoning    | ⚡⚡   | $$$  |
| `gemini-2.0-flash-exp` | Trying new features  | ⚡⚡⚡ | $    |

For this codelab: **gemini-2.5-flash** is perfect!

### Q: Can I switch models dynamically?

**A:** Yes! Pass model as parameter:

```typescript
private startChat(model: string = 'gemini-2.5-flash'): void {
  this.chat = this.ai.chats.create({ model, config: {...} });
}
```

### Q: What are system instructions?

**A:** They guide the AI's behavior:

```typescript
config: {
  systemInstruction: 'You are a friendly tech support agent...',
  tools: [...]
}
```

Use them to:

- Define personality
- Set expertise domain
- Add constraints
- Provide context

### Q: How do I control response length?

**A:** Use generation config:

```typescript
config: {
  maxOutputTokens: 500,  // Shorter responses
  temperature: 0.7,      // Creativity level
  topP: 0.8,
  topK: 40
}
```

### Q: What is temperature and how does it work?

**A:** Temperature controls randomness:

- **0.0-0.3**: Focused, deterministic (good for facts)
- **0.4-0.7**: Balanced (good for chat)
- **0.8-1.0**: Creative, varied (good for writing)

```typescript
config: {
  temperature: 0.2; // For factual responses
}
```

---

## 🌐 Grounding & Search

### Q: What is grounding?

**A:** Grounding connects AI responses to real-world sources (web, documents) for accuracy and citations.

### Q: When should I use Google Search grounding?

**A:** Use it for:

- ✅ Current events
- ✅ Real-time data
- ✅ Fact-checking
- ✅ Recent information

Don't use for:

- ❌ Personal/private data
- ❌ Time-sensitive critical decisions
- ❌ When low latency is crucial

### Q: How do citations work?

**A:** Gemini returns:

1. `groundingChunks`: Source URLs and titles
2. `groundingSupports`: Which parts cite which sources
3. UI displays as [1], [2] links

See `chat-message.component.ts` for implementation.

### Q: Can I use my own documents for grounding?

**A:** Yes! Use `urlContext`:

```typescript
tools: [
  {
    urlContext: {
      urls: ['https://your-docs.com/page1', 'https://your-docs.com/page2'],
    },
  },
];
```

### Q: Does grounding cost more?

**A:** Search results may use additional tokens, but it's minimal and within free tier for development.

---

## 💻 Development & Debugging

### Q: How do I debug function calls?

**A:** Use console.log strategically:

```typescript
// In gemini.service.ts
console.log('Function called:', name);
console.log('Arguments:', args);
console.log('Result:', result);

// In browser console (F12)
// You'll see each function call with details
```

Also check the Network tab for API calls.

### Q: The app is slow. How can I improve performance?

**A:** Optimization tips:

1. **Use Flash model:**

   ```typescript
   model: 'gemini-2.5-flash';
   ```

2. **Reduce context:**

   - Keep conversation history shorter
   - Trim old messages

3. **Implement caching:**

   ```typescript
   config: {
     cachedContent: previousContext;
   }
   ```

4. **Use streaming:**
   ```typescript
   const stream = await this.chat.sendMessageStreaming(...);
   ```

### Q: How do I handle errors gracefully?

**A:** Wrap in try-catch:

```typescript
try {
  const response = await this.geminiService.sendMessage(message);
  // Handle success
} catch (error) {
  if (error.message.includes('quota')) {
    // Show quota exceeded message
  } else if (error.message.includes('network')) {
    // Show network error
  } else {
    // Generic error
  }
}
```

### Q: Can I test without using real API calls?

**A:** Yes! Create a mock service:

```typescript
class MockGeminiService {
  async sendMessage(prompt: string): Promise<ChatMessage> {
    return {
      role: 'model',
      content: 'Mock response for: ' + prompt,
    };
  }
}
```

Use in tests or development.

### Q: How do I add TypeScript types for Gemini responses?

**A:** The `@google/genai` library includes types:

```typescript
import {
  GenerateContentResponse,
  Part,
  FunctionCall,
  GroundingMetadata,
} from '@google/genai';
```

---

## 🎨 UI & User Experience

### Q: How do I add a typing indicator?

**A:** Use a loading state:

```typescript
// In component
@if (isLoading()) {
  <div class="typing-indicator">
    <span></span><span></span><span></span>
  </div>
}

// CSS for animation
.typing-indicator span {
  animation: blink 1.4s infinite;
}
```

See `app.component.html` for existing implementation.

### Q: Can I customize the chat UI?

**A:** Absolutely! The app uses TailwindCSS:

```typescript
// Change colors in chat-message.component.html
[class.bg-blue-500]="isUser()"  // Change to bg-purple-500
```

Or modify `tailwind.config.js` for global changes.

### Q: How do I add message timestamps?

**A:** Update the model:

```typescript
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp?: Date;  // Add this
}

// When creating messages
{
  role: 'user',
  content: message,
  timestamp: new Date()
}
```

Display in template:

```html
<span class="text-xs"> {{ message().timestamp | date:'short' }} </span>
```

### Q: How do I implement streaming responses (typewriter effect)?

**A:** Use `sendMessageStreaming`:

```typescript
async sendMessageStreaming(prompt: string) {
  const stream = await this.chat!.sendMessageStreaming({
    message: prompt
  });

  let fullText = '';
  for await (const chunk of stream) {
    fullText += chunk.text;
    // Update UI with partial response
    this.currentMessage.set(fullText);
  }
}
```

---

## 🔒 Security & Best Practices

### Q: Is it safe to call Gemini API from the browser?

**A:** For development and personal projects: Yes  
For production: Consider a backend proxy

**Why backend proxy?**

- Hide API keys
- Rate limiting
- Request validation
- Usage tracking
- Cost control

### Q: How do I implement rate limiting?

**A:** Track requests:

```typescript
class RateLimiter {
  private requests: Date[] = [];
  private limit = 10; // 10 requests
  private window = 60000; // per minute

  canMakeRequest(): boolean {
    const now = new Date();
    this.requests = this.requests.filter(
      (time) => now.getTime() - time.getTime() < this.window
    );

    if (this.requests.length < this.limit) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
}
```

### Q: How do I validate user input?

**A:** Sanitize and validate:

```typescript
sendMessage() {
  const input = this.userInput().trim();

  // Validate length
  if (input.length > 1000) {
    this.showError('Message too long');
    return;
  }

  // Sanitize HTML
  const sanitized = this.sanitizeHtml(input);

  // Send to API
  this.geminiService.sendMessage(sanitized);
}
```

### Q: Should I log user conversations?

**A:** Consider:

- ✅ Privacy regulations (GDPR, CCPA)
- ✅ User consent
- ✅ Data retention policies
- ✅ Secure storage

If logging:

- Anonymize data
- Encrypt storage
- Set expiration
- Provide user access/deletion

---

## 🚀 Deployment

### Q: How do I deploy this app?

**A:** Popular options:

**Vercel (easiest):**

```bash
npm install -g vercel
vercel
```

**Netlify:**

```bash
npm run build
# Upload dist/ folder to Netlify
```

**Firebase Hosting:**

```bash
npm install -g firebase-tools
firebase init
firebase deploy
```

### Q: Do I need to change anything for production?

**A:** Yes, checklist:

- [ ] Use environment variables for API key
- [ ] Enable production mode
- [ ] Add error tracking (Sentry)
- [ ] Implement analytics
- [ ] Add monitoring
- [ ] Set up CI/CD
- [ ] Configure CORS
- [ ] Add rate limiting

### Q: How do I use environment variables in production?

**A:** Most platforms support env vars:

**Vercel:**

```bash
vercel env add VITE_GEMINI_API_KEY
```

**Netlify:**
Dashboard → Site settings → Environment variables

**Code:**

```typescript
apiKey: import.meta.env.VITE_GEMINI_API_KEY;
```

---

## 🎓 Learning & Next Steps

### Q: What should I learn next?

**A:** Recommended path:

1. **Complete challenges** in CODELAB.md
2. **Build a project** with real use case
3. **Explore multimodal** (images, audio)
4. **Learn prompt engineering**
5. **Study RAG** (Retrieval Augmented Generation)
6. **Implement streaming**
7. **Try fine-tuning** (advanced)

### Q: Where can I find more examples?

**A:** Resources:

- [Gemini Cookbook](https://github.com/google-gemini/cookbook)
- [AI Studio](https://aistudio.google.com) - Try prompts
- [Official Docs](https://ai.google.dev/docs)
- [Community Forums](https://discuss.ai.google.dev)

### Q: Can I use Gemini with other frameworks?

**A:** Yes! The `@google/genai` library works with:

- React
- Vue
- Svelte
- Plain JavaScript
- Node.js backend
- Any JavaScript environment

### Q: What's the difference between this and ChatGPT integration?

**A:** Key differences:

| Feature          | Gemini               | ChatGPT             |
| ---------------- | -------------------- | ------------------- |
| Provider         | Google               | OpenAI              |
| Grounding        | Native Google Search | Requires plugin     |
| Free Tier        | Generous             | Limited             |
| Multimodal       | Built-in             | Separate models     |
| Function Calling | Native               | Tools/Functions API |

Both are powerful - choose based on your needs!

---

## 🐛 Troubleshooting

### Q: I get CORS errors. What do I do?

**A:** This shouldn't happen with Gemini API (CORS-enabled). If it does:

1. Check if API key is correct
2. Verify you're using the right endpoint
3. Try incognito/private window
4. Clear browser cache
5. Check browser console for exact error

### Q: npm install fails. How do I fix it?

**A:** Try these steps:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try yarn
npm install -g yarn
yarn install
```

### Q: The app builds but shows blank page. Help!

**A:** Debug steps:

1. Check browser console (F12) for errors
2. Verify API key is set
3. Check network tab for failed requests
4. Try hard refresh (Ctrl+Shift+R)
5. Check Angular version compatibility

### Q: Function calls work in console but not in UI. Why?

**A:** Likely a state management issue:

```typescript
// Make sure you're using signals properly
this.messages.update((current) => [...current, newMessage]);

// Not:
this.messages.push(newMessage); // Won't trigger change detection
```

---

## 📱 Mobile & Accessibility

### Q: Is the app mobile-friendly?

**A:** The default UI is responsive! Test on different screens. To improve:

```typescript
// Use responsive Tailwind classes
<div class="w-full md:max-w-2xl lg:max-w-4xl">
```

### Q: How do I make it accessible?

**A:** Add ARIA labels and keyboard support:

```html
<input aria-label="Chat message input" placeholder="Type your message..." />

<button aria-label="Send message" [disabled]="isLoading()">Send</button>
```

Test with screen readers!

---

## 💬 Community & Support

### Q: Where can I get help?

**A:** Multiple channels:

- 💬 GDG Community Discord/Slack
- 📧 Email: [organizer email]
- 🐛 GitHub Issues: [repo url]
- 💡 Stack Overflow: Tag `gemini-api`
- 📖 [Official Forum](https://discuss.ai.google.dev)

### Q: Can I contribute to this project?

**A:** Yes! Ways to contribute:

- 🐛 Report bugs
- ✨ Suggest features
- 📖 Improve documentation
- 🎨 Enhance UI
- 🧪 Add tests
- 💡 Share your projects

### Q: How can I share my project?

**A:** We'd love to see it!

- Tweet with #GeminiAPI #GDG
- Post in community forum
- Add to showcase (if available)
- Present at next meetup!

---

## 📊 Advanced Topics

### Q: How do I implement conversation memory?

**A:** Use localStorage:

```typescript
// Save
localStorage.setItem('chatHistory', JSON.stringify(messages));

// Load
const saved = localStorage.getItem('chatHistory');
if (saved) {
  this.messages.set(JSON.parse(saved));
}
```

### Q: Can I use Gemini for code generation?

**A:** Absolutely! Gemini is great for:

- Code completion
- Bug fixes
- Code explanation
- Refactoring suggestions
- Documentation generation

### Q: How do I handle multi-turn conversations?

**A:** Chat sessions maintain context automatically:

```typescript
// First message
await chat.sendMessage({ message: "What's 2+2?" });
// Response: "4"

// Follow-up (context preserved)
await chat.sendMessage({ message: 'Now multiply that by 3' });
// Response: "12" (understands "that" = 4)
```

### Q: Can I fine-tune Gemini for my specific use case?

**A:** Not yet for direct fine-tuning, but you can:

- Use detailed system instructions
- Provide examples in context
- Use grounding with your documents
- Implement RAG (Retrieval Augmented Generation)

---

**Have a question not listed here?**  
Open an issue or ask in the community forum!

**Last Updated:** October 29, 2025
