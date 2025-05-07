// app/admin/actions.ts
'use server'

import { initializeSchema } from '../../lib/weaviate/schema';

export async function setupWeaviateSchema() {
    try {
        console.log('Starting Weaviate schema initialization...');
        const result = await initializeSchema();

        if (result.success) {
            console.log('✅ Schema successfully initialized!');
            return {
                success: true,
                message: 'Schema successfully initialized!'
            };
        } else {
            console.error('❌ Error initializing schema:', result.error);
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}