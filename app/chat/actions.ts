'use server';

import { nanoid } from 'nanoid';
import { auth } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';
import { getWeaviateClient } from "@/lib/weaviate/client";

// Type definitions
export type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
};

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    organizationId: string; // Keeping for compatibility
};

export type DocumentSearchResult = {
    content: string;
    title: string;
    url: string;
    certainty: number;
};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Get user from Clerk session tokens
export async function getUser() {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        throw new Error('User not authenticated');
    }

    // Log the session claims for debugging
    console.log('Session claims:', sessionClaims);

    // You can extract any data from sessionClaims here
    const userData = {
        userId,
        email: sessionClaims?.email || '',
        firstName: sessionClaims?.firstName || '',
        lastName: sessionClaims?.lastName || '',
    };

    return userData;
}

// Search documents in Weaviate based on query and user ID
export async function searchDocuments(query: string, userId: string, limit: number = 5) {
    const client = await getWeaviateClient();

    try {
        // Using GraphQL API approach for consistency with the rest of the code
        const result = await client.graphql
            .get()
            .withClassName("Document")
            .withNearText({
                concepts: [query],
                certainty: 0.7
            })
            .withLimit(limit)
            .withWhere({
                operator: "Equal",
                path: ["userId"],
                valueString: userId
            })
            .withFields("content title url _additional { certainty }")
            .do();

        if (!result.data || !result.data.Get || !result.data.Get.Document || result.data.Get.Document.length === 0) {
            return [];
        }

        return result.data.Get.Document.map((doc: any) => ({
            content: doc.content,
            title: doc.title,
            url: doc.url,
            certainty: doc._additional?.certainty || 0
        }));
    } catch (error) {
        console.error('Error searching documents:', error);
        return [];
    } finally {
        await client.close();
    }
}

// Generate chat response using OpenAI with document context
export async function generateChatResponse(
    messages: Message[],
    query: string,
    userId: string
): Promise<string> {
    // Search for relevant documents based on the query and user ID
    const relevantDocs = await searchDocuments(query, userId);

    // Format documents as context for the AI
    const docsContext = relevantDocs.length
        ? `Relevant documents:\n${relevantDocs.map(doc =>
            `Title: ${doc.title}\nContent: ${doc.content}\nURL: ${doc.url}\n---`
        ).join('\n')}`
        : 'No relevant documents found.';

    // Format conversation history for OpenAI API
    const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
    }));

    // Add system message with instructions about using user context
    const systemMessage = {
        role: 'system' as const,
        content: `You are an AI assistant that helps users with their queries about their documents. 
    
    When answering, follow these guidelines:
    1. Use the provided user-specific documents as context for your answers when relevant.
    2. If the documents provide a direct answer to the query, highlight this information.
    3. If you don't find relevant information in the documents, clearly state that and provide a more general response.
    4. Always cite your sources when using information from the documents.
    5. Keep responses concise and focused on answering the user's question.
    
    ${docsContext}`
    };

    try {
        // Get response from OpenAI using the current API
        const completion = await openai.chat.completions.create({
            model: "o3-mini",
            messages: [
                systemMessage,
                ...formattedMessages
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        // Extract the response
        const responseContent = completion.choices[0]?.message?.content;
        return responseContent || 'Sorry, I couldn\'t generate a response.';
    } catch (error) {
        console.error('Error generating AI response:', error);
        return 'I encountered an error while generating a response. Please try again.';
    }
}

// Get all chat sessions for a user
export async function getChatSessions() {
    try {
        // Get user info with session claims from Clerk
        const userData = await getUser();
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("ChatSession")
                .withFields("id title messages createdAt updatedAt organizationId")
                .withWhere({
                    operator: "Equal",
                    path: ["userId"],
                    valueString: userData.userId
                })
                .withSort([{ path: ["updatedAt"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.ChatSession || result.data.Get.ChatSession.length === 0) {
                return [];
            }

            // Parse messages and return
            return result.data.Get.ChatSession.map((session: any) => ({
                id: session.id,
                title: session.title,
                userId: userData.userId,
                messages: JSON.parse(session.messages || '[]') as Message[],
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt),
                organizationId: session.organizationId
            }));
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        throw new Error('Failed to fetch chat sessions');
    }
}

// Get a single chat session by ID
export async function getChatSession(chatId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("ChatSession")
                .withFields("id title messages createdAt updatedAt userId organizationId")
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: chatId
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.ChatSession || result.data.Get.ChatSession.length === 0) {
                return null;
            }

            const session = result.data.Get.ChatSession[0];
            return {
                id: session.id,
                title: session.title,
                messages: JSON.parse(session.messages || '[]') as Message[],
                createdAt: new Date(session.createdAt),
                updatedAt: new Date(session.updatedAt),
                userId: session.userId,
                organizationId: session.organizationId
            };
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching chat session ${chatId}:`, error);
        throw new Error('Failed to fetch chat session');
    }
}

// Create a new chat session
export async function createChatSession() {
    try {
        // Get user info from session tokens
        const userData = await getUser();
        const client = await getWeaviateClient();

        try {
            const now = new Date().toISOString();
            const sessionId = nanoid();

            await client.data
                .creator()
                .withClassName("ChatSession")
                .withId(sessionId)
                .withProperties({
                    title: 'New Chat',
                    messages: '[]', // Empty JSON array as string
                    userId: userData.userId,
                    organizationId: 'default', // Using default value
                    createdAt: now,
                    updatedAt: now
                })
                .do();

            // Return the session
            return {
                id: sessionId,
                title: 'New Chat',
                messages: [] as Message[],
                createdAt: new Date(now),
                updatedAt: new Date(now),
                userId: userData.userId,
                organizationId: 'default'
            };
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error creating chat session:', error);
        throw new Error('Failed to create chat session');
    }
}

// Search chat sessions by query
export async function searchChatSessions(query: string) {
    try {
        // Get all sessions first
        const allSessions = await getChatSessions();

        // Filter sessions based on the query
        if (!query) return allSessions;

        const lowerQuery = query.toLowerCase();
        return allSessions.filter(session => {
            // Search in title
            if (session.title.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in message content
            return session.messages.some(msg =>
                msg.content.toLowerCase().includes(lowerQuery)
            );
        });
    } catch (error) {
        console.error('Error searching chat sessions:', error);
        throw new Error('Failed to search chat sessions');
    }
}

// Create a message and get AI response
export async function createMessageAndGetResponse(formData: FormData) {
    try {
        const sessionId = formData.get('sessionId') as string;
        const content = formData.get('content') as string;

        if (!sessionId || !content) {
            throw new Error('Session ID and content are required');
        }

        // Get user info from Clerk with session claims
        const userData = await getUser();

        // Get the current session
        const session = await getChatSession(sessionId);

        if (!session) {
            throw new Error('Chat session not found');
        }

        // Create user message
        const userMessage: Message = {
            id: nanoid(),
            role: 'user',
            content,
            createdAt: new Date(),
        };

        // Add user message to session
        const updatedMessages = [...session.messages, userMessage];
        const messagesJson = JSON.stringify(updatedMessages);

        // Update the session with the user message in Weaviate
        const client = await getWeaviateClient();

        try {
            const now = new Date().toISOString();
            const title = session.title === 'New Chat' ? content.slice(0, 50) : session.title;

            await client.data
                .updater()
                .withClassName("ChatSession")
                .withId(sessionId)
                .withProperties({
                    messages: messagesJson,
                    title: title,
                    updatedAt: now
                })
                .do();

            // Generate AI response
            const aiResponse = await generateChatResponse(
                updatedMessages,
                content,
                userData.userId
            );

            // Create assistant message
            const assistantMessage: Message = {
                id: nanoid(),
                role: 'assistant',
                content: aiResponse,
                createdAt: new Date(),
            };

            // Add assistant message to session
            const finalMessages = [...updatedMessages, assistantMessage];
            const finalMessagesJson = JSON.stringify(finalMessages);

            // Update the session with the assistant message
            await client.data
                .updater()
                .withClassName("ChatSession")
                .withId(sessionId)
                .withProperties({
                    messages: finalMessagesJson,
                    updatedAt: new Date().toISOString()
                })
                .do();

            return {
                userMessage,
                assistantMessage,
                session: {
                    ...session,
                    messages: finalMessages,
                }
            };
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Chat action error:', error);
        throw new Error(error.message || 'Failed to process chat request');
    }
}

// Delete empty chat sessions (for cleanup)
export async function deleteEmptyChatSessions() {
    try {
        const userData = await getUser();
        const client = await getWeaviateClient();

        try {
            // Get all sessions for the user with their messages
            const result = await client.graphql
                .get()
                .withClassName("ChatSession")
                .withFields("id messages")
                .withWhere({
                    operator: "Equal",
                    path: ["userId"],
                    valueString: userData.userId
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.ChatSession || result.data.Get.ChatSession.length === 0) {
                return { deletedCount: 0 };
            }

            // Identify sessions with no messages
            const emptySessionIds = result.data.Get.ChatSession
                .filter((session: any) => {
                    const messages = JSON.parse(session.messages || '[]');
                    return messages.length === 0;
                })
                .map((session: any) => session.id);

            // Delete empty sessions
            for (const id of emptySessionIds) {
                await client.data
                    .deleter()
                    .withClassName("ChatSession")
                    .withId(id)
                    .do();
            }

            return { deletedCount: emptySessionIds.length };
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error deleting empty sessions:', error);
        throw new Error('Failed to clean up empty chat sessions');
    }
}