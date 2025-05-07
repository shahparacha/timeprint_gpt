// lib/weaviate/client.ts
import weaviate, { WeaviateClient } from 'weaviate-client';

// Create a client connection function
export async function getWeaviateClient(): Promise<WeaviateClient> {
    return weaviate.connectToWeaviateCloud(
        '5zegkvslsbc299suebh2jg.c0.us-west3.gcp.weaviate.cloud',
        {
            authCredentials: new weaviate.ApiKey('4xscFunraKcfmuQ94USNbj7Xu7MyvE3Lsf48'),
        }
    );
}