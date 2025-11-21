import { GoogleGenAI, Part, GenerateContentResponse } from "@google/genai";
import { Message, Attachment } from '../types';

// Ensure API key is available
const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export const sendMessageToGeminiStream = async (
  history: Message[],
  newMessage: string,
  systemInstruction: string,
  attachments: Attachment[] = []
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    // Convert internal history format to Gemini chat format with support for parts
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
      history: history.map(msg => {
        const parts: Part[] = [];
        
        // Add text part if exists
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        
        // Add attachment parts if exist
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
            parts.push({
              inlineData: {
                mimeType: att.mimeType,
                data: att.data
              }
            });
          });
        }

        return {
          role: msg.role,
          parts: parts,
        };
      }),
    });

    // Construct the new message parts
    const currentParts: Part[] = [];
    if (newMessage) {
      currentParts.push({ text: newMessage });
    }
    
    attachments.forEach(att => {
      currentParts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: att.data
        }
      });
    });

    // Send message with parts using stream
    const response = await chat.sendMessageStream({
      message: currentParts
    });

    return response;

  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};
