import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage, MessageSender, AIAction } from '../types';

let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;

const getAI = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

const getChat = (): Chat => {
    if (!chat) {
        const genAI = getAI();
        chat = genAI.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a helpful assistant for a document editor. Your name is Codex. Be concise, helpful, and friendly. You can help with writing, brainstorming, and answering questions. Format your answers with markdown when appropriate.",
            },
        });
    }
    return chat;
}

export const sendMessageToAI = async (message: string, documentContext?: string): Promise<ChatMessage> => {
    try {
        const chatInstance = getChat();
        
        const fullMessage = documentContext 
            ? `Given the following document context, please answer the user's query.\n\n---\n\nDOCUMENT CONTEXT:\n${documentContext}\n\n---\n\nUSER QUERY:\n${message}`
            : message;

        const result = await chatInstance.sendMessage({ message: fullMessage });
        const text = result.text;
        
        return {
            id: `ai-${Date.now()}`,
            sender: MessageSender.AI,
            text: text,
        };
    } catch (error) {
        console.error("Error sending message to AI:", error);
        return {
            id: `error-${Date.now()}`,
            sender: MessageSender.SYSTEM,
            text: "Sorry, I encountered an error. Please try again.",
        };
    }
};


export const performAIAction = async (action: AIAction, text: string): Promise<string> => {
    try {
        const genAI = getAI();
        let prompt = '';
        switch (action) {
            case 'improve':
                prompt = `Improve the following text for clarity, tone, and style. Only return the improved text, without any introductory phrases:\n\n"${text}"`;
                break;
            case 'summarize':
                prompt = `Summarize the following text concisely. Only return the summary, without any introductory phrases:\n\n"${text}"`;
                break;
            case 'fix':
                prompt = `Fix any spelling and grammar mistakes in the following text. Only return the corrected text, without any introductory phrases:\n\n"${text}"`;
                break;
            case 'translate':
                prompt = `Translate the following text to English. Only return the translated text, without any introductory phrases:\n\n"${text}"`;
                break;
        }

        const response = await genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error(`Error performing AI action "${action}":`, error);
        return text; // Return original text on error
    }
}