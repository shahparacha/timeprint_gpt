// lib/weaviate/client.ts
import weaviate from 'weaviate-ts-client';

export function getWeaviateClient() {
    const apiKey = process.env.WEAVIATE_API_KEY;
    const endpoint = process.env.WEAVIATE_CLUSTER_URL;

    if (!apiKey || !endpoint) {
        throw new Error('Weaviate API key or endpoint not found');
    }

    try {
        console.log("Connecting to Weaviate at:", endpoint);
        // Use v2 client which works better with Next.js
        const client = weaviate.client({
            scheme: 'https',
            host: endpoint,
            apiKey: new weaviate.ApiKey(apiKey),
        });

        console.log("Connected to Weaviate successfully");
        return client;
    } catch (error) {
        console.error('Error connecting to Weaviate:', error);
        throw new Error('Failed to connect to Weaviate');
    }
}