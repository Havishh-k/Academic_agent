import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, UserRole } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert internal Message type to Gemini Content type
const mapMessagesToContent = (messages: Message[]): Content[] => {
  return messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content } as Part],
  }));
};

export const sendMessageToAgent = async (
  currentMessages: Message[],
  userRole: UserRole
): Promise<string> => {
  try {
    // Construct the system instruction based on role
    let systemInstruction = SYSTEM_INSTRUCTION_BASE;
    
    if (userRole === UserRole.FACULTY) {
      systemInstruction += `\n\n**TEACHER INSIGHT MODE ACTIVE:**
The current user is identified as a "Faculty Member" or "Admin". 
Provide high-level insights on student misconceptions and curriculum gaps based on the context of the conversation. 
You may be more direct with faculty members than with students.`;
    }

    // We can't use chat history efficiently with `ai.chats.create` if we want to change system instruction dynamically per turn easily without rebuilding, 
    // but for this app, we will rebuild the history for each request to ensure statelessness from the server perspective 
    // and full control over the context window.
    // However, `chats.create` is efficient for handling history. 
    // Since we need to inject the system instruction which is large, we will use `generateContent` with the full history each time 
    // OR create a new chat instance each time with the correct history. Creating a new chat instance is cleaner.

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for academic precision
      },
      history: mapMessagesToContent(currentMessages.slice(0, -1)), // All previous messages
    });

    const lastMessage = currentMessages[currentMessages.length - 1];
    const result = await chat.sendMessage({ message: lastMessage.content });
    
    return result.text || "I apologize, but I couldn't generate a response based on the course materials.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
};
