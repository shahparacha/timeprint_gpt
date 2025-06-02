import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createChatSession } from './actions';
import { auth } from '@clerk/nextjs/server';
import ClientChatWrapper from './ClientChatWrapper';

export default async function ChatPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    try {
        // Create a new chat session
        // Revalidation is handled inside the server action
        const session = await createChatSession();

        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Document Chat</h1>
                    <p className="text-[#333333]">
                        Ask questions and get answers based on your documents
                    </p>
                </div>

                <div className="card-neumorphic min-h-[70vh] flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-medium text-[#DA7756]">New Conversation</h2>
                        <Link
                            href="/chat/history"
                            className="btn-neumorphic text-[#333333]"
                        >
                            Chat History
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col">
                        {/* Pass only serializable data to client component */}
                        <ClientChatWrapper initialSession={JSON.parse(JSON.stringify(session))} />
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        // This will catch any errors during session creation
        console.error('Error in ChatPage:', error);

        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="card-neumorphic text-center p-8">
                    <h3 className="text-xl font-medium mb-2 text-[#DA7756]">Error Creating Chat</h3>
                    <p className="text-[#333333] mb-4">
                        There was an error creating your chat session. Please try again later.
                    </p>
                    <Link
                        href="/"
                        className="btn-neumorphic btn-primary inline-block"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }
}