
import { Component, input, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../models/chat.model';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageComponent {
  message = input.required<ChatMessage>();

  isUser(): boolean {
    return this.message().role === 'user';
  }
  
  isModel(): boolean {
    return this.message().role === 'model';
  }

  isTool(): boolean {
    return this.message().role === 'tool';
  }

  processedContent = computed(() => {
    const message = this.message();
    if (!message.groundingSupports || message.groundingSupports.length === 0 || !message.groundingChunks) {
      return message.content;
    }

    let content = message.content;
    const supports = [...message.groundingSupports].sort((a, b) => b.segment.endIndex - a.segment.endIndex);

    for (const support of supports) {
      const end = support.segment.endIndex;
      const links = support.groundingChunkIndices.map(index => {
        const chunk = message.groundingChunks![index];
        return `<a href="${chunk.uri}" target="_blank" class="text-blue-600 hover:underline"><sup>[${index + 1}]</sup></a>`;
      }).join('');
      content = content.substring(0, end) + links + content.substring(end);
    }

    return content;
  });
}
