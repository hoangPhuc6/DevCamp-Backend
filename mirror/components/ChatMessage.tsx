import React, { useMemo } from 'react';
import { ChatMessage } from '../models/chat.model';

interface Props {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: Props) {
  const isUser = message.role === 'user';
  const isModel = message.role === 'model';
  const isTool = message.role === 'tool';

  const processedContent = useMemo(() => {
    if (!message.groundingSupports || message.groundingSupports.length === 0 || !message.groundingChunks) {
      return message.content;
    }

    let content = message.content;
    const supports = [...message.groundingSupports].sort(
      (a: any, b: any) => b.segment.endIndex - a.segment.endIndex
    );

    for (const support of supports) {
      const end = (support as any).segment.endIndex;
      const links = (support as any).groundingChunkIndices
        .map((index: number) => {
          const chunk = message.groundingChunks![index];
          return `<a href="${chunk.uri}" target="_blank" class="text-mirror-400 hover:text-mirror-300 hover:underline transition-colors"><sup>[${index + 1}]</sup></a>`;
        })
        .join('');
      content = content.substring(0, end) + links + content.substring(end);
    }

    return content;
  }, [message]);

  const renderContent = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/^• /gm, '<span class="text-mirror-400 mr-1">•</span>');
    return html;
  };

  const finalContent = renderContent(processedContent);

  return (
    <div
      className={`w-full px-3 py-1.5 flex message-enter ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
        {(isModel || isTool) && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-mirror-600 to-mirror-800 flex items-center justify-center text-white text-sm shadow-md shadow-mirror-600/20 mt-0.5">
            🧠
          </div>
        )}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-600/20 mt-0.5">
            U
          </div>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-mirror-600 to-mirror-700 text-white rounded-br-md shadow-lg shadow-mirror-600/10'
              : 'bg-dark-800/80 text-dark-100 rounded-bl-md border border-dark-700/40'
          }`}
        >
          {message.searchEntryPoint && (
            <div
              className="mb-2 text-xs"
              dangerouslySetInnerHTML={{ __html: message.searchEntryPoint }}
            />
          )}

          {isTool && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
              <p className="text-[11px] text-amber-400/80 font-mono font-medium">Tool Response</p>
            </div>
          )}

          <div
            className="whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: finalContent }}
          />

          {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-3 pt-2 border-t border-dark-700/30">
              <p className="text-[10px] text-dark-500 font-mono mb-1.5">Sources</p>
              <div className="flex flex-wrap gap-1.5">
                {message.groundingChunks.map((chunk, i) => (
                  <a
                    key={i}
                    href={chunk.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-mirror-400/70 hover:text-mirror-300 bg-dark-900/50 px-2 py-0.5 rounded-md border border-dark-700/30 hover:border-mirror-600/30 transition-all font-mono truncate max-w-[200px]"
                  >
                    [{i + 1}] {chunk.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
