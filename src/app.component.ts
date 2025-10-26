import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  effect,
  viewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { ChatMessage } from './models/chat.model';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit {
  private geminiService = inject(GeminiService);

  messages = signal<ChatMessage[]>([]);
  userInput = signal('');
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef>('chatContainer');

  constructor() {
    this.messages.set([
      {
        role: 'model',
        content:
          "Hello! I'm a Gemini-powered chatbot. You can ask me about the weather or an order status. Try 'What's the weather in Tokyo?' or 'Status for order 501?'",
      },
    ]);
  }

  ngAfterViewInit(): void {
    effect(() => {
      if (this.messages()) {
        this.scrollToBottom();
      }
    });
  }

  async sendMessage(): Promise<void> {
    const userMessage = this.userInput().trim();
    if (!userMessage || this.isLoading()) {
      return;
    }

    // Add user message to chat
    this.messages.update((current) => [
      ...current,
      { role: 'user', content: userMessage },
    ]);
    this.userInput.set('');
    this.isLoading.set(true);

    try {
      // Get response from Gemini
      const response = await this.geminiService.sendMessage(userMessage);

      // Add model response to chat
      this.messages.update((current) => [...current, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      this.messages.update((current) => [
        ...current,
        {
          role: 'model',
          content: `Sorry, something went wrong: ${errorMessage}`,
        },
      ]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }
}
