'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createMessageAndGetResponse } from './actions';
import { Message, ChatSession } from './actions';

export default function ClientChatWrapper({ initialSession }: { initialSession: ChatSession }) {
    // Remove all useAuth imports and usage
    const [session, setSession] = useState<ChatSession>(initialSession);
    const [messages, setMessages] = useState<Message[]>(initialSession?.messages || []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        // Store message content before clearing input
        const messageContent = input;

        // Clear input immediately for better UX
        setInput('');

        // Add user message to state immediately for UI responsiveness
        const userMessage = {
            id: 'temp-id-' + Date.now(),
            role: 'user' as const,
            content: messageContent,
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Create FormData for the request
            const formData = new FormData();
            formData.append('sessionId', initialSession.id);
            formData.append('content', messageContent);

            // Send the message and get AI response using server action
            const result = await createMessageAndGetResponse(formData);

            // Update the session and messages state with the result
            setSession(result.session);
            setMessages(result.session.messages);

            // Revalidation is handled by the server action
        } catch (error) {
            console.error('Error sending message:', error);
            // Add error message
            setMessages(prev => [
                ...prev,
                {
                    id: 'error-' + Date.now(),
                    role: 'assistant',
                    content: 'Sorry, there was an error processing your message. Please try again.',
                    createdAt: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-[#333333] my-8">
                        <h3 className="text-xl font-semibold mb-2 text-[#DA7756]">Welcome to your personal document chatbot!</h3>
                        <p className="mt-2">Ask me anything about your documents.</p>
                    </div>
                ) : (
                    messages.map(message => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            <div
                                className={`max-w-md p-4 rounded-lg ${message.role === 'user'
                                    ? 'bg-[#DA7756] text-white'
                                    : 'card-neumorphic text-[#333333]'
                                    }`}
                            >
                                {message.role === 'assistant' ? (
                                    // Using a simple div instead of ReactMarkdown
                                    <div className="prose prose-sm max-w-none">
                                        {message.content}
                                    </div>
                                ) : (
                                    message.content
                                )}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-md p-4 rounded-lg card-neumorphic text-[#333333]">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce delay-75"></div>
                                <div className="w-2 h-2 rounded-full bg-[#DA7756] animate-bounce delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="card-neumorphic flex overflow-hidden">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none text-[#333333]"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`btn-primary px-6 ${isLoading || !input.trim() ? 'opacity-50' : ''}`}
                        disabled={isLoading || !input.trim()}
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}