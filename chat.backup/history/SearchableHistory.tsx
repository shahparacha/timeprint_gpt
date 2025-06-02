'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChatSession } from '@/app/chat/actions';

interface SearchableHistoryProps {
    sessions: ChatSession[];
    initialQuery: string;
}

export default function SearchableHistory({ sessions, initialQuery }: SearchableHistoryProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [filteredSessions, setFilteredSessions] = useState(sessions);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Filter sessions based on search query
    useEffect(() => {
        if (!searchQuery) {
            setFilteredSessions(sessions);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = sessions.filter(session => {
            // Search in title
            if (session.title.toLowerCase().includes(query)) {
                return true;
            }

            // Search in messages content
            return session.messages.some(msg =>
                msg.content.toLowerCase().includes(query)
            );
        });

        setFilteredSessions(filtered);
    }, [searchQuery, sessions]);

    // Update URL when search query changes
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Create new URLSearchParams
        const params = new URLSearchParams(searchParams);

        // Update or delete the query parameter
        if (searchQuery) {
            params.set('query', searchQuery);
        } else {
            params.delete('query');
        }

        // Update the URL
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div>
            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex space-x-2">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search your chat history..."
                        className="flex-1 px-4 py-3 card-neumorphic focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="btn-neumorphic px-6 py-3"
                    >
                        Search
                    </button>
                </form>
            </div>

            {filteredSessions.length === 0 ? (
                <div className="card-neumorphic text-center p-8">
                    {searchQuery ? (
                        <>
                            <h3 className="text-xl font-medium mb-2 text-[#DA7756]">No matching chats found</h3>
                            <p className="text-[#333333] mb-4">
                                Try a different search term or clear your search
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    router.push(pathname);
                                }}
                                className="btn-neumorphic btn-primary inline-block"
                            >
                                Clear Search
                            </button>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-medium mb-2 text-[#DA7756]">No chats found</h3>
                            <p className="text-[#333333] mb-4">
                                Start by creating your first chat
                            </p>
                            <Link
                                href="/chat"
                                className="btn-neumorphic btn-primary inline-block"
                            >
                                Start Chatting
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.map((session) => (
                        <div
                            key={session.id}
                            className="card-neumorphic transition-all hover:shadow-lg"
                        >
                            <Link href={`/chat/${session.id}`} className="block p-6">
                                <h3 className="text-xl font-semibold mb-2 truncate text-[#DA7756]">
                                    {session.title}
                                </h3>
                                <div className="space-y-2 text-[#333333]">
                                    <p className="text-sm">
                                        Messages: {session.messages.length}
                                    </p>
                                    <p className="text-sm">
                                        Created: {new Date(session.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm">
                                        Last updated: {new Date(session.updatedAt).toLocaleDateString()}
                                    </p>
                                    {searchQuery && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs font-medium text-[#DA7756]">Search matches:</p>
                                            {getMatchPreview(session, searchQuery)}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </div>
                    ))}

                    <Link
                        href="/chat"
                        className="card-neumorphic p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-all group"
                    >
                        <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-[#DA7756] text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-1 text-[#DA7756]">New Chat</h3>
                        <p className="text-[#333333] text-sm">Start a new conversation</p>
                    </Link>
                </div>
            )}
        </div>
    );
}

// Helper function to show preview of matching content
function getMatchPreview(session: ChatSession, query: string) {
    const lowerQuery = query.toLowerCase();

    // Check title match
    if (session.title.toLowerCase().includes(lowerQuery)) {
        return (
            <p className="text-xs text-gray-600 mt-1 truncate">
                Title: "...{highlightMatch(session.title, query)}..."
            </p>
        );
    }

    // Find first matching message
    for (const msg of session.messages) {
        if (msg.content.toLowerCase().includes(lowerQuery)) {
            const content = msg.content;
            const matchIndex = content.toLowerCase().indexOf(lowerQuery);

            // Get context around the match (up to 30 chars before and after)
            const start = Math.max(0, matchIndex - 30);
            const end = Math.min(content.length, matchIndex + query.length + 30);
            const preview = content.substring(start, end);

            return (
                <p className="text-xs text-gray-600 mt-1 truncate">
                    {start > 0 ? '...' : ''}
                    {highlightMatch(preview, query)}
                    {end < content.length ? '...' : ''}
                </p>
            );
        }
    }

    return null;
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string): JSX.Element {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    if (!lowerText.includes(lowerQuery)) {
        return <>{text}</>;
    }

    const parts = [];
    let lastIndex = 0;
    let currentIndex = lowerText.indexOf(lowerQuery, lastIndex);

    while (currentIndex !== -1) {
        // Add text before match
        if (currentIndex > lastIndex) {
            parts.push(text.substring(lastIndex, currentIndex));
        }

        // Add highlighted match
        parts.push(
            <span key={currentIndex} className="bg-yellow-200 text-black font-medium">
                {text.substring(currentIndex, currentIndex + query.length)}
            </span>
        );

        lastIndex = currentIndex + query.length;
        currentIndex = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
}