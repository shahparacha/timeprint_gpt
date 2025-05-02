import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getChatSession } from '../actions';
import { auth } from '@clerk/nextjs/server';
import ClientChatWrapper from '../ClientChatWrapper';

interface ChatSessionPageProps {
    params: {
        chatId: string;
    };
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
    const { chatId } = params;

    // Authentication check
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    try {
        // Get the chat session
        const session = await getChatSession(chatId);

        // If session doesn't exist, show 404
        if (!session) {
            notFound();
        }

        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Chat Session</h1>
                    <p className="text-[#333333]">
                        Continuing your conversation
                    </p>
                </div>

                <div className="card-neumorphic min-h-[70vh] flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-medium text-[#DA7756] truncate">{session.title}</h2>
                        <div className="flex space-x-3">
                            <Link
                                href="/chat"
                                className="btn-neumorphic text-[#333333]"
                            >
                                New Chat
                            </Link>
                            <Link
                                href="/chat/history"
                                className="btn-neumorphic text-[#333333]"
                            >
                                Chat History
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {/* Pass only serializable data to client component */}
                        <ClientChatWrapper initialSession={JSON.parse(JSON.stringify(session))} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error in ChatSessionPage:', error);

        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="card-neumorphic text-center p-8">
                    <h3 className="text-xl font-medium mb-2 text-[#DA7756]">Error</h3>
                    <p className="text-[#333333] mb-4">
                        An error occurred while loading this chat session.
                    </p>
                    <Link
                        href="/chat/history"
                        className="btn-neumorphic btn-primary inline-block"
                    >
                        Back to Chat History
                    </Link>
                </div>
            </div>
        );
    }
}