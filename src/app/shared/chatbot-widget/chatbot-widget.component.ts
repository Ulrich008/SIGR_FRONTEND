import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../core/services/chatbot.service';
import { CHATBOT_SUGGESTIONS } from '../../core/data/chatbot-knowledge-base';

@Component({
  standalone: true,
  selector: 'app-chatbot-widget',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.component.html'
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  draft = '';
  readonly suggestions = CHATBOT_SUGGESTIONS;
  readonly guideUrl = 'assets/guide/index.html';

  constructor(public chatbot: ChatbotService, private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggle(): void {
    this.chatbot.isOpen = !this.chatbot.isOpen;
  }

  close(): void {
    this.chatbot.isOpen = false;
  }

  send(text?: string): void {
    const message = (text ?? this.draft).trim();
    if (!message) return;

    this.chatbot.messages.push({ from: 'user', text: message });
    this.draft = '';

    // Petit délai pour un rendu "conversationnel" plutôt qu'instantané.
    // L'app est zoneless : un setTimeout ne déclenche pas seul un nouveau
    // rendu, il faut le forcer explicitement une fois la réponse ajoutée.
    setTimeout(() => {
      const reply = this.chatbot.ask(message);
      this.chatbot.messages.push(reply);
      this.cdr.detectChanges();
    }, 350);
  }

  guideLinkFor(anchor?: string): string {
    return anchor ? `${this.guideUrl}#${anchor}` : this.guideUrl;
  }

  /** Convertit le **gras** markdown des réponses (statiques, écrites par l'app) en HTML sûr. */
  formatText(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  private scrollToBottom(): void {
    if (!this.scrollAnchor) return;
    try {
      this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch {
      // ignore
    }
  }
}
