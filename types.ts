import { LucideIcon } from 'lucide-react';

export interface Entity {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: LucideIcon;
  systemInstruction: string;
  colorClass: string;
}

export interface Attachment {
  type: 'image' | 'file';
  mimeType: string;
  data: string; // Base64 string
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface SavedSession {
  id: string;
  entityId: string;
  title: string; // Usually the first message or entity name
  preview: string;
  lastModified: number;
  messages: Message[];
}

export type AppView = 'home' | 'chat';

export interface ChatSession {
  entityId: string; // 'private-lawyer' or entity ID
  messages: Message[];
}