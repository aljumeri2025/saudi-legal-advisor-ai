import { Suggestion } from '../types';

const STORAGE_KEY = 'saudi_advisor_suggestions';

export const getSuggestions = (): Suggestion[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse suggestions", e);
    return [];
  }
};

export const addSuggestion = (suggestion: Omit<Suggestion, 'id' | 'timestamp'>): Suggestion => {
  const currentSuggestions = getSuggestions();
  
  const newSuggestion: Suggestion = {
    ...suggestion,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  const updatedSuggestions = [newSuggestion, ...currentSuggestions];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSuggestions));
  
  return newSuggestion;
};

export const clearSuggestions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};