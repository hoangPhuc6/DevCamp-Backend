import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './models/chat.model';
import { ChatMessageComponent } from './components/ChatMessage';
import { geminiService } from './services/gemini.service';
import { useStudy } from './hooks/useStudy';


const WELCOME_MESSAGE: ChatMessage = {
  role: 'model',
  content: `🧠 **Welcome to Thinking Mirror!**

I'm your DSA mentor — but I won't write code for you. Instead, I'll help you **think through problems** step by step.

Try telling me a problem you're working on, like:
• "I need to find two numbers that add up to a target"
• "How do I detect a cycle in a linked list?"
• "I'm stuck on the merge intervals problem"

Let's train your brain! 💪`,
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    reports,
    roadmap,
    profile,
    isGeneratingReport,
    isGeneratingRoadmap,
    error,
    addSession,
    generateMonthlyReport,
    generateRoadmap,
    toggleRoadmapTask,
    resetAllData,
  } = useStudy();

  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      }, 50);
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(trimmed);
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages((prev) => [
        ...prev,
        { role: 'model', content: `Sorry, something went wrong: ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center bg-dark-950 p-3 md:p-6 overflow-hidden">
      <div className="w-full max-w-3xl h-full flex gap-4 transition-all duration-300 items-stretch">

        {/* Chat Interface */}
        <div className="flex-1 h-full flex flex-col rounded-2xl overflow-hidden glass animate-fade-in">

          {/* Header */}
          <header className="px-5 py-4 border-b border-dark-700/50 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mirror-500 to-mirror-700 flex items-center justify-center text-white text-lg shadow-lg shadow-mirror-500/20">
                🧠
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-50 tracking-tight">
                Thinking <span className="gradient-text">Mirror</span>
              </h1>
              <p className="text-xs text-dark-400 font-medium">
                Train your brain, not your clipboard
              </p>
            </div>
          </header>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"
        >
          {messages.map((message, index) => (
            <ChatMessageComponent key={index} message={message} />
          ))}
          {isLoading && (
            <div className="w-full px-3 py-2 flex justify-start message-enter">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-mirror-600 to-mirror-800 flex items-center justify-center text-white text-sm shadow-md shadow-mirror-600/20">
                  🧠
                </div>
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-dark-800/80 border border-dark-700/40 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-mirror-400 rounded-full bounce-dot"></div>
                  <div className="w-2 h-2 bg-mirror-400 rounded-full bounce-dot"></div>
                  <div className="w-2 h-2 bg-mirror-400 rounded-full bounce-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <footer className="p-4 border-t border-dark-700/50 bg-dark-900/50">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-end gap-3"
          >
            <div className="flex-1 relative">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your approach or ask about a DSA problem..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-dark-700/50 text-dark-100 placeholder-dark-500 focus:ring-2 focus:ring-mirror-500/40 focus:border-mirror-600/50 focus:outline-none transition-all duration-200 resize-none text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || userInput.trim() === ''}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-mirror-600 to-mirror-700 text-white flex items-center justify-center hover:from-mirror-500 hover:to-mirror-600 focus:ring-2 focus:ring-mirror-500/40 focus:outline-none transition-all duration-200 disabled:from-dark-700 disabled:to-dark-700 disabled:text-dark-500 disabled:cursor-not-allowed shadow-lg shadow-mirror-600/20 disabled:shadow-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-dark-600 mt-2 text-center font-mono">
            Shift + Enter for new line • AI will never show you code solutions
          </p>
        </footer>

        </div>

      </div>
    </main>
  );
}
