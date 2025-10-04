export interface Document {
  id: string;
  name: string;
  content: string;
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
}

export type AppView = 'editor' | 'settings';

export type Theme = 'light' | 'dark';

// New types for user settings
export type FontSize = 'sm' | 'base' | 'lg';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface UserSettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
  wordWrap: boolean;
  autoSave: boolean;
}

export type ExportFormat = 'txt' | 'md' | 'json';

export type AIAction = 'improve' | 'summarize' | 'fix' | 'translate';