import { Injectable } from '@angular/core';
import {
  CHATBOT_FALLBACK_ANSWER,
  CHATBOT_KNOWLEDGE_BASE,
  CHATBOT_WELCOME_MESSAGE,
  ChatbotEntry
} from '../data/chatbot-knowledge-base';

export interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  anchor?: string;
}

/** Score minimum (nombre de mots-clés touchés) pour accepter une correspondance. */
const MATCH_THRESHOLD = 1;

/** Plage Unicode des signes diacritiques combinants (accents), une fois le texte décomposé en NFD. */
const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  /**
   * État de la conversation conservé au niveau du service (singleton) pour
   * survivre à la navigation SPA d'une page à l'autre — comme MenuService.
   * Réinitialisé explicitement à la connexion/déconnexion (voir AuthService).
   */
  readonly messages: ChatMessage[] = [
    { from: 'bot', text: CHATBOT_WELCOME_MESSAGE }
  ];

  isOpen = false;

  ask(rawMessage: string): ChatMessage {
    const entry = this.findBestMatch(rawMessage);
    return entry
      ? { from: 'bot', text: entry.answer, anchor: entry.anchor }
      : { from: 'bot', text: CHATBOT_FALLBACK_ANSWER, anchor: 'intro' };
  }

  reset(): void {
    this.messages.length = 0;
    this.messages.push({ from: 'bot', text: CHATBOT_WELCOME_MESSAGE });
    this.isOpen = false;
  }

  private findBestMatch(rawMessage: string): ChatbotEntry | null {
    const tokens = this.normalize(rawMessage);
    if (tokens.length === 0) return null;

    let best: ChatbotEntry | null = null;
    let bestScore = 0;

    for (const entry of CHATBOT_KNOWLEDGE_BASE) {
      const score = this.scoreEntry(tokens, entry);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }

    return bestScore >= MATCH_THRESHOLD ? best : null;
  }

  private scoreEntry(userTokens: string[], entry: ChatbotEntry): number {
    const userText = userTokens.join(' ');
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedKeyword.includes(' ')) {
        // Une expression complète (ex. "circuit de validation") compte double.
        if (userText.includes(normalizedKeyword)) score += 2;
      } else if (userTokens.includes(normalizedKeyword)) {
        score += 1;
      } else if (userTokens.some(t => t.length > 3 && normalizedKeyword.includes(t))) {
        score += 0.5;
      }
    }
    return score;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(DIACRITICS_REGEX, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .trim();
  }

  private normalize(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter(t => t.length > 0);
  }
}
