
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
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
}
