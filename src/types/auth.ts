export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatarColor: string;
  favoriteStyle: string;
  createdAt: number;
}

export type AssistantPersonality = 'amiga' | 'chic' | 'zen' | 'hype';

export interface AssistantAvatar {
  id: string;
  name: string;
  emoji: string;
  style: string;
  gradient: string;
  textColor: string;
}

export interface AssistantConfig {
  name: string;
  avatarId: string;
  personality: AssistantPersonality;
  enthusiasmLevel: number; // 1 to 5
  customGreeting?: string;
  favoriteColorTone?: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: number;
  outfitReaction?: boolean;
}
