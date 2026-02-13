import { EDGE_FUNCTION_BASE_URL, AI_COURSE_ID } from './supabaseClient';
import { Message, UserRole, AgentStep } from '../types';

const FASTAPI_BASE_URL = 'http://localhost:8000';

interface TutorResponse {
    response: string;
    agentSteps: AgentStep[];
    retrievedSources: { source: string; similarity: number }[];
}

/**
 * Try FastAPI RAG+Socratic backend first, fall back to Edge Functions.
 */
export const sendMessageToTutor = async (
    currentMessages: Message[],
    userRole: UserRole,
    studentId: string,
    subjectId: string
): Promise<TutorResponse> => {
    const lastMessage = currentMessages[currentMessages.length - 1];

    // --- Attempt 1: FastAPI Backend (RAG + Socratic Engine) ---
    try {
        const fastApiPayload = {
            query: lastMessage.content,
            subject_id: subjectId,
            conversation_history: currentMessages.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content,
            })),
            mastery_score: 0.5,
            student_id: studentId,
        };

        const res = await fetch(`${FASTAPI_BASE_URL}/api/chat/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fastApiPayload),
            signal: AbortSignal.timeout(30000), // 30s timeout
        });

        if (res.ok) {
            const data = await res.json();
            return {
                response: data.response || "I apologize, but I couldn't generate a response.",
                agentSteps: [
                    { agent: 'intent_classifier', status: data.intent || 'done' },
                    { agent: 'rag_retriever', status: data.confidence || 'done' },
                    { agent: 'socratic_engine', status: data.strategy || 'done' },
                ],
                retrievedSources: (data.sources || []).map((s: any) => ({
                    source: s.source_document || 'Unknown',
                    similarity: s.relevance || 0,
                })),
            };
        }
        console.warn('FastAPI returned error, falling back to Edge Function:', res.status);
    } catch (err) {
        console.warn('FastAPI backend unavailable, using Edge Function fallback:', err);
    }

    // --- Attempt 2: Edge Function Fallback ---
    try {
        const payload = {
            messages: currentMessages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            userRole: userRole,
            studentId: studentId,
            courseId: subjectId,
        };

        const res = await fetch(`${EDGE_FUNCTION_BASE_URL}/tutor-agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Tutor agent error: ${res.status} - ${errText}`);
        }

        const data = await res.json();

        return {
            response: data.response || "I apologize, but I couldn't generate a response.",
            agentSteps: data.agentSteps || [],
            retrievedSources: data.retrievedSources || [],
        };
    } catch (error) {
        console.error("Failed to call tutor agent:", error);
        return {
            response: "I encountered an error while processing your request. Please try again.",
            agentSteps: [{ agent: 'tutor', status: 'error' }],
            retrievedSources: [],
        };
    }
};

export const seedKnowledgeBase = async (
    documents: { title: string; content: string; source: string }[],
    onProgress?: (current: number, total: number, docTitle: string) => void
): Promise<{ success: boolean; message: string }> => {
    let totalChunks = 0;
    const errors: string[] = [];

    // Send documents ONE AT A TIME to avoid Edge Function resource exhaustion
    for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        onProgress?.(i + 1, documents.length, doc.title);

        try {
            const res = await fetch(`${EDGE_FUNCTION_BASE_URL}/curator-agent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    course_id: AI_COURSE_ID,
                    documents: [doc], // Send one document at a time
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                errors.push(`${doc.title}: HTTP ${res.status} - ${errText}`);
                continue;
            }

            const data = await res.json();
            if (data.success) {
                totalChunks += data.total_chunks || 0;
            } else {
                errors.push(`${doc.title}: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            errors.push(`${doc.title}: ${String(error)}`);
        }

        // Small delay between documents to avoid rate limiting
        if (i < documents.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    if (errors.length > 0) {
        console.warn("Seed errors:", errors);
        return {
            success: totalChunks > 0,
            message: `Processed ${totalChunks} chunks from ${documents.length} docs. ${errors.length} error(s): ${errors[0]}`,
        };
    }

    return {
        success: true,
        message: `Successfully processed ${totalChunks} chunks from ${documents.length} documents`,
    };
};
