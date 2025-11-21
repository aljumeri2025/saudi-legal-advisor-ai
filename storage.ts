import { Message, SavedSession } from '../types';
import { SAUDI_ENTITIES, PRIVATE_LAWYER_ENTITY } from '../constants';

const STORAGE_KEY = 'saudi_advisor_history';

// Helper to get raw history from local storage without filtering
const getHistoryRaw = (): SavedSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
};

export const saveSession = (
  sessionId: string,
  entityId: string,
  messages: Message[]
): SavedSession | null => {
  // Filter Logic: Only save if there is at least one user message.
  const hasUserMessage = messages.some(m => m.role === 'user');
  if (!hasUserMessage) {
    return null; 
  }

  const history = getHistoryRaw();
  
  // Find entity name for title fallback
  const allEntities = [...SAUDI_ENTITIES, PRIVATE_LAWYER_ENTITY];
  const entity = allEntities.find(e => e.id === entityId);
  
  // Generate title from first user message or entity name
  const firstUserMsg = messages.find(m => m.role === 'user');
  let title = entity?.name || 'محادثة جديدة';
  if (firstUserMsg) {
    title = firstUserMsg.text.slice(0, 40) + (firstUserMsg.text.length > 40 ? '...' : '');
  }

  // Generate preview
  const lastMsg = messages[messages.length - 1];
  const preview = lastMsg ? lastMsg.text.slice(0, 60) : '...';

  const newSession: SavedSession = {
    id: sessionId,
    entityId,
    title,
    preview,
    lastModified: Date.now(),
    messages
  };

  const existingIndex = history.findIndex(h => h.id === sessionId);
  if (existingIndex >= 0) {
    history[existingIndex] = newSession;
  } else {
    history.unshift(newSession);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newSession;
};

export const getHistory = (): SavedSession[] => {
  const rawHistory = getHistoryRaw();
  // Filter: Ensure we only return sessions that actually have user interaction
  return rawHistory.filter(session => 
    session.messages && 
    session.messages.length > 0 &&
    session.messages.some(m => m.role === 'user')
  );
};

export const getSession = (sessionId: string): SavedSession | undefined => {
  const history = getHistoryRaw();
  return history.find(h => h.id === sessionId);
};

export const deleteSession = (sessionId: string): SavedSession[] => {
  const history = getHistoryRaw();
  const newHistory = history.filter(h => h.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  
  // Return the filtered version for UI
  return newHistory.filter(session => 
    session.messages && 
    session.messages.length > 0 &&
    session.messages.some(m => m.role === 'user')
  );
};

export const clearAllHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};