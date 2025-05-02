import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getChatSessions } from '@/app/chat/actions';
import { auth } from '@clerk/nextjs/server';
import { Suspense } from 'react';
import SearchableHistory from '@/app/chat/history/SearchableHistory';

export default async function ChatHistoryPage({
    searchParams,
}: {
    searchParams: { query?: string };
}) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    try {
        // Get chat sessions
        const sessions = await getChatSessions();

        // Filter out sessions with no messages
        const validSessions = sessions.filter(session =>
            session.messages && session.messages.length > 0
        );

        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Chat History</h1>
                    <p className="text-[#333333]">
                        View and search your previous conversations
                    </p>
                </div>

                <div className="mb-6 flex justify-between items-center">
                    <Link
                        href="/chat"
                        className="btn-neumorphic btn-primary inline-block"
                    >
                        New Chat
                    </Link>
                </div>

                <Suspense fallback={<div className="text-center py-8">Loading sessions...</div>}>
                    <SearchableHistory
                        sessions={validSessions}
                        initialQuery={searchParams.query || ''}
                    />
                </Suspense>
            </div>
        );
    } catch (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="card-neumorphic text-center p-8">
                    <h3 className="text-xl font-medium mb-2 text-[#DA7756]">Error</h3>
                    <p className="text-[#333333] mb-4">
                        An error occurred while fetching your chat history.
                    </p>
                    <Link
                        href="/chat"
                        className="btn-neumorphic btn-primary inline-block"
                    >
                        Back to Chat
                    </Link>
                </div>
            </div>
        );
    }
}