'use client'

import { useState } from 'react';
import { setupWeaviateSchema } from '../actions';

export default function SetupPage() {
    const [status, setStatus] = useState<{ loading: boolean; message: string; success?: boolean }>({
        loading: false,
        message: ''
    });

    const handleSetup = async () => {
        setStatus({ loading: true, message: 'Setting up Weaviate schema...' });

        try {
            const result = await setupWeaviateSchema();

            if (result.success) {
                setStatus({
                    loading: false,
                    message: result.message || 'Schema initialized successfully!',
                    success: true
                });
            } else {
                setStatus({
                    loading: false,
                    message: `Error: ${result.error || 'Unknown error'}`,
                    success: false
                });
            }
        } catch (error) {
            setStatus({
                loading: false,
                message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
                success: false
            });
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Weaviate Schema Setup</h1>

            <button
                onClick={handleSetup}
                disabled={status.loading}
                className={`px-4 py-2 rounded ${status.loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
                {status.loading ? 'Setting up...' : 'Initialize Schema'}
            </button>

            {status.message && (
                <div className={`mt-4 p-4 rounded ${status.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
}