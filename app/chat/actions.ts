'use server';

import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { OpenAI } from 'openai';

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
    organizationId: string; // Keeping for DB compatibility
};

export type DocumentSearchResult = {
    content: string;
    title: string;
    url: string;
    _additional: {
        certainty: number;
    };
};

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Weaviate client
let weaviateClient: WeaviateClient;

const getWeaviateClient = () => {
    if (!weaviateClient) {
        weaviateClient = weaviate.client({
            scheme: process.env.WEAVIATE_SCHEME || 'https',
            host: process.env.WEAVIATE_HOST || 'localhost:8080',
            apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || ''),
        });
    }
    return weaviateClient;
};

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
    //change this to work differently, do i have graphql out of box?
    const client = getWeaviateClient();

    const result = await client.graphql
        .get()
        .withClassName('Document')
        .withFields('content title url _additional { certainty }')
        .withNearText({ concepts: [query] })
        .withWhere({
            operator: 'Equal',
            path: ['userId'],
            valueString: userId,
        })
        .withLimit(limit)
        .do();

    return result.data.Get.Document as DocumentSearchResult[];
}

// Generate chat response using OpenAI with document context
export async function generateChatResponse(
    // change this to work differently for after you send message
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

    // Format conversation history
    const formattedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
    }));

    // Add system message with instructions about using user context
    const systemMessage = {
        role: 'system',
        content: `You are an AI assistant that helps users with their queries about their documents. 
    
    When answering, follow these guidelines:
    1. Use the provided user-specific documents as context for your answers when relevant.
    2. If the documents provide a direct answer to the query, highlight this information.
    3. If you don't find relevant information in the documents, clearly state that and provide a more general response.
    4. Always cite your sources when using information from the documents.
    5. Keep responses concise and focused on answering the user's question.
    
    ${docsContext}`
    };

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [systemMessage, ...formattedMessages],
        max_tokens: 1500,
        temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
}

// Get all chat sessions for a user
export async function getChatSessions() {
    try {
        // Get user info with session claims from Clerk
        const userData = await getUser();

        // Get sessions from database
        const sessions = await db.chatSession.findMany({
            where: {
                userId: userData.userId,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Parse messages and return
        return sessions.map(session => ({
            ...session,
            messages: JSON.parse(session.messages || '[]') as Message[],
        }));
    } catch (error: any) {
        console.error('Error fetching chat sessions:', error);
        throw new Error('Failed to fetch chat sessions');
    }
}

// Get a single chat session by ID
export async function getChatSession(chatId: string) {
    try {
        const session = await db.chatSession.findUnique({
            where: { id: chatId },
        });

        if (!session) return null;

        return {
            ...session,
            messages: JSON.parse(session.messages || '[]') as Message[],
        };
    } catch (error: any) {
        console.error(`Error fetching chat session ${chatId}:`, error);
        throw new Error('Failed to fetch chat session');
    }
}

// Create a new chat session
export async function createChatSession() {
    try {
        // Get user info from session tokens
        const userData = await getUser();

        // Create session in database
        const session = await db.chatSession.create({
            data: {
                title: 'New Chat',
                messages: '[]', // Empty JSON array as string
                userId: userData.userId,
                organizationId: 'default', // Using default value
            },
        });

        // Return the session
        return {
            ...session,
            messages: [] as Message[],
        };
    } catch (error: any) {
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
    } catch (error: any) {
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

        // Update the session with the user message
        await db.chatSession.update({
            where: { id: sessionId },
            data: {
                messages: JSON.stringify(updatedMessages),
                // If this is the first user message and the title is still default, use it to create a better title
                title: session.title === 'New Chat' ? content.slice(0, 50) : session.title,
            },
        });

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

        // Update the session with the assistant message
        await db.chatSession.update({
            where: { id: sessionId },
            data: {
                messages: JSON.stringify(finalMessages),
            },
        });

        return {
            userMessage,
            assistantMessage,
            session: {
                ...session,
                messages: finalMessages,
            }
        };
    } catch (error: any) {
        console.error('Chat action error:', error);
        throw new Error(error.message || 'Failed to process chat request');
    }
}

// Delete empty chat sessions (for cleanup)
export async function deleteEmptyChatSessions() {
    try {
        const userData = await getUser();

        // Get all sessions
        const sessions = await db.chatSession.findMany({
            where: {
                userId: userData.userId,
            },
        });

        // Identify sessions with no messages
        const emptySessionIds = sessions
            .filter(session => {
                const messages = JSON.parse(session.messages || '[]');
                return messages.length === 0;
            })
            .map(session => session.id);

        if (emptySessionIds.length > 0) {
            // Delete empty sessions
            await db.chatSession.deleteMany({
                where: {
                    id: {
                        in: emptySessionIds
                    }
                }
            });
        }

        return { deletedCount: emptySessionIds.length };
    } catch (error) {
        console.error('Error deleting empty sessions:', error);
        throw new Error('Failed to clean up empty chat sessions');
    }
}