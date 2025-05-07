// lib/weaviate/schema.ts
import { getWeaviateClient } from './client';
// Import necessary data types for Weaviate v3 client
import { dataType, vectorizer } from 'weaviate-client';
import type {
    Project, Subcontractor, Worker, Report, Blueprint,
    WorkerProject, WorkerIdentification, ChatSession, ClassReference
} from './models';

/**
 * Updates the Weaviate schema with collections and references
 */
export async function updateSchema(): Promise<{ success: boolean; error?: any }> {
    let client;

    try {
        // Await the client initialization
        client = await getWeaviateClient();

        // Define the collections to create
        const collections = [
            {
                name: "Project",
                description: "Construction or development project",
                properties: [
                    { name: "name", dataType: dataType.TEXT },
                    { name: "description", dataType: dataType.TEXT },
                    { name: "address", dataType: dataType.TEXT },
                    { name: "city", dataType: dataType.TEXT },
                    { name: "state", dataType: dataType.TEXT },
                    { name: "country", dataType: dataType.TEXT },
                    { name: "zipCode", dataType: dataType.TEXT },
                    { name: "clerkOrgId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "Subcontractor",
                description: "Business or individual hired to perform specific work",
                properties: [
                    { name: "name", dataType: dataType.TEXT },
                    { name: "contactName", dataType: dataType.TEXT },
                    { name: "email", dataType: dataType.TEXT },
                    { name: "phone", dataType: dataType.TEXT },
                    { name: "address", dataType: dataType.TEXT },
                    { name: "unitNumber", dataType: dataType.TEXT },
                    { name: "city", dataType: dataType.TEXT },
                    { name: "state", dataType: dataType.TEXT },
                    { name: "country", dataType: dataType.TEXT },
                    { name: "zipCode", dataType: dataType.TEXT },
                    { name: "taxId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "SubcontractorProject",
                description: "Junction table for Subcontractor-Project relationship",
                properties: [
                    { name: "assignedAt", dataType: dataType.DATE },
                    { name: "subcontractorId", dataType: dataType.TEXT },
                    { name: "projectId", dataType: dataType.TEXT },
                ]
            },
            {
                name: "Worker",
                description: "Individual worker associated with a subcontractor",
                properties: [
                    { name: "firstName", dataType: dataType.TEXT },
                    { name: "lastName", dataType: dataType.TEXT },
                    { name: "email", dataType: dataType.TEXT },
                    { name: "phone", dataType: dataType.TEXT },
                    { name: "subcontractorId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "WorkerProject",
                description: "Junction class for Worker-Project relationship",
                properties: [
                    { name: "assignedAt", dataType: dataType.DATE },
                    { name: "workerId", dataType: dataType.TEXT },
                    { name: "projectId", dataType: dataType.TEXT },
                ]
            },
            {
                name: "WorkerIdentification",
                description: "Identification documents for a worker",
                properties: [
                    { name: "fileName", dataType: dataType.TEXT },
                    { name: "filePath", dataType: dataType.TEXT },
                    { name: "fileType", dataType: dataType.TEXT },
                    { name: "fileSize", dataType: dataType.INT },
                    { name: "issueDate", dataType: dataType.DATE },
                    { name: "expiryDate", dataType: dataType.DATE },
                    { name: "workerId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "Report",
                description: "Reports of what a worker did and the worker's camera attached to his or her construction vest of the worker saw. The camera is shot in point of view of the construction worker. Exact contents of reports are customized by an Administrator of the project the worker is working on.",
                properties: [
                    { name: "title", dataType: dataType.TEXT },
                    { name: "filePath", dataType: dataType.TEXT },
                    { name: "fileType", dataType: dataType.TEXT },
                    { name: "fileSize", dataType: dataType.INT },
                    { name: "reportDate", dataType: dataType.DATE },
                    { name: "projectId", dataType: dataType.TEXT },
                    { name: "workerId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "Blueprint",
                description: "Blueprint files associated with a project",
                properties: [
                    { name: "title", dataType: dataType.TEXT },
                    { name: "filePath", dataType: dataType.TEXT },
                    { name: "fileType", dataType: dataType.TEXT },
                    { name: "fileSize", dataType: dataType.INT },
                    { name: "projectId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
            {
                name: "ChatSession",
                description: "Chat sessions between users",
                properties: [
                    { name: "title", dataType: dataType.TEXT },
                    { name: "messages", dataType: dataType.TEXT },
                    { name: "userId", dataType: dataType.TEXT },
                    { name: "organizationId", dataType: dataType.TEXT },
                    { name: "createdAt", dataType: dataType.DATE },
                    { name: "updatedAt", dataType: dataType.DATE },
                ]
            },
        ];

        // Create all collections
        for (const collectionConfig of collections) {
            const exists = await client.collections.exists(collectionConfig.name);

            if (!exists) {
                console.log(`Creating collection: ${collectionConfig.name}`);
                await client.collections.create(collectionConfig);
            } else {
                console.log(`Collection ${collectionConfig.name} already exists, skipping creation.`);
            }
        }

        // Define the references between collections
        const references = [
            // Project relationships
            { from: "Project", to: "Report", name: "reports" },
            { from: "Project", to: "Blueprint", name: "blueprints" },
            { from: "Project", to: "WorkerProject", name: "workers" },
            { from: "Project", to: "SubcontractorProject", name: "subcontractors" },

            // Subcontractor relationships
            { from: "Subcontractor", to: "Worker", name: "workers" },
            { from: "Subcontractor", to: "SubcontractorProject", name: "projects" },

            // Worker relationships
            { from: "Worker", to: "WorkerProject", name: "projects" },
            { from: "Worker", to: "Report", name: "reports" },
            { from: "Worker", to: "WorkerIdentification", name: "identifications" },

            // Junction relationships
            { from: "WorkerProject", to: "Worker", name: "worker" },
            { from: "WorkerProject", to: "Project", name: "project" },
            { from: "SubcontractorProject", to: "Subcontractor", name: "subcontractor" },
            { from: "SubcontractorProject", to: "Project", name: "project" },

            // Other relationships
            { from: "Report", to: "Project", name: "project" },
            { from: "Report", to: "Worker", name: "worker" },
            { from: "Blueprint", to: "Project", name: "project" },
            { from: "WorkerIdentification", to: "Worker", name: "worker" },
        ];

        // Add the references
        for (const ref of references) {
            // Check if collection exists
            const exists = await client.collections.exists(ref.from);

            if (exists) {
                try {
                    const collection = client.collections.get(ref.from);
                    // Get collection configuration to check existing properties
                    const config = await collection.config.get();
                    const properties = config.properties?.map(prop => prop.name) || [];

                    if (!properties.includes(ref.name)) {
                        console.log(`Adding reference: ${ref.name} to ${ref.from}`);
                        // Add the reference property
                        await collection.config.addProperty({
                            name: ref.name,
                            dataType: [ref.to], // References use array notation with target class name
                        });
                    } else {
                        console.log(`Reference ${ref.name} already exists in ${ref.from}, skipping.`);
                    }
                } catch (e) {
                    console.error(`Error adding reference ${ref.name} to ${ref.from}:`, e);
                }
            }
        }

        console.log("Schema update completed.");
        return { success: true };
    } catch (error) {
        console.error("Error updating schema:", error);
        return { success: false, error };
    } finally {
        if (client) {
            try {
                // Close the client connection when done
                await client.close();
            } catch (e) {
                console.error("Error closing Weaviate client:", e);
            }
        }
    }
}

/**
 * Initialize the schema - can be called from a server action
 */
export async function initializeSchema(): Promise<{ success: boolean; error?: any }> {
    return await updateSchema();
}

/**
 * Create a new subcontractor
 */
export async function createSubcontractor(data: Omit<Subcontractor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const collection = client.collections.get('Subcontractor');
        const result = await collection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        return result.id;
    } catch (error) {
        console.error("Error creating subcontractor:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Create a new worker
 */
export async function createWorker(data: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const workerCollection = client.collections.get('Worker');

        // Create worker object
        const result = await workerCollection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        const workerId = result.id;

        // Create reference from worker to subcontractor
        if (data.subcontractorId) {
            const subcontractorCollection = client.collections.get('Subcontractor');

            // Add reference from worker to subcontractor
            await workerCollection.data.referenceAdd(
                workerId,
                'subcontractor',
                { targetCollection: 'Subcontractor', targetId: data.subcontractorId }
            );

            // Add this worker to the subcontractor's workers collection
            await subcontractorCollection.data.referenceAdd(
                data.subcontractorId,
                'workers',
                { targetCollection: 'Worker', targetId: workerId }
            );
        }

        return workerId;
    } catch (error) {
        console.error("Error creating worker:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Assign a worker to a project
 */
export async function assignWorkerToProject(workerId: string, projectId: string): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const workerProjectCollection = client.collections.get('WorkerProject');
        const workerCollection = client.collections.get('Worker');
        const projectCollection = client.collections.get('Project');

        // Create the junction object
        const result = await workerProjectCollection.data.insert({
            workerId,
            projectId,
            assignedAt: now,
        });

        const junctionId = result.id;

        // Create references
        await workerProjectCollection.data.referenceAdd(
            junctionId,
            'worker',
            { targetCollection: 'Worker', targetId: workerId }
        );

        await workerProjectCollection.data.referenceAdd(
            junctionId,
            'project',
            { targetCollection: 'Project', targetId: projectId }
        );

        // Add to collections from both sides
        await workerCollection.data.referenceAdd(
            workerId,
            'projects',
            { targetCollection: 'WorkerProject', targetId: junctionId }
        );

        await projectCollection.data.referenceAdd(
            projectId,
            'workers',
            { targetCollection: 'WorkerProject', targetId: junctionId }
        );

        return junctionId;
    } catch (error) {
        console.error("Error assigning worker to project:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Add a blueprint to a project
 */
export async function addBlueprint(data: Omit<Blueprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const blueprintCollection = client.collections.get('Blueprint');
        const projectCollection = client.collections.get('Project');

        // Create blueprint object
        const result = await blueprintCollection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        const blueprintId = result.id;

        // Create reference from blueprint to project
        await blueprintCollection.data.referenceAdd(
            blueprintId,
            'project',
            { targetCollection: 'Project', targetId: data.projectId }
        );

        // Add to project's blueprints collection
        await projectCollection.data.referenceAdd(
            data.projectId,
            'blueprints',
            { targetCollection: 'Blueprint', targetId: blueprintId }
        );

        return blueprintId;
    } catch (error) {
        console.error("Error adding blueprint:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Create a report for a worker
 */
export async function createReport(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const reportCollection = client.collections.get('Report');
        const projectCollection = client.collections.get('Project');
        const workerCollection = client.collections.get('Worker');

        // Create report object
        const result = await reportCollection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        const reportId = result.id;

        // Create references
        await reportCollection.data.referenceAdd(
            reportId,
            'project',
            { targetCollection: 'Project', targetId: data.projectId }
        );

        await reportCollection.data.referenceAdd(
            reportId,
            'worker',
            { targetCollection: 'Worker', targetId: data.workerId }
        );

        // Add to collections
        await projectCollection.data.referenceAdd(
            data.projectId,
            'reports',
            { targetCollection: 'Report', targetId: reportId }
        );

        await workerCollection.data.referenceAdd(
            data.workerId,
            'reports',
            { targetCollection: 'Report', targetId: reportId }
        );

        return reportId;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Create a worker identification document
 */
export async function createWorkerIdentification(data: Omit<WorkerIdentification, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const identificationCollection = client.collections.get('WorkerIdentification');
        const workerCollection = client.collections.get('Worker');

        // Create identification object
        const result = await identificationCollection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        const identificationId = result.id;

        // Create reference from identification to worker
        await identificationCollection.data.referenceAdd(
            identificationId,
            'worker',
            { targetCollection: 'Worker', targetId: data.workerId }
        );

        // Add to worker's identifications collection
        await workerCollection.data.referenceAdd(
            data.workerId,
            'identifications',
            { targetCollection: 'WorkerIdentification', targetId: identificationId }
        );

        return identificationId;
    } catch (error) {
        console.error("Error creating worker identification:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Create a chat session
 */
export async function createChatSession(data: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    let client;

    try {
        client = await getWeaviateClient();
        const now = new Date().toISOString();

        const chatSessionCollection = client.collections.get('ChatSession');

        // Create chat session object
        const result = await chatSessionCollection.data.insert({
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        return result.id;
    } catch (error) {
        console.error("Error creating chat session:", error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Get a project by ID
 */
export async function getProjectById(projectId: string): Promise<Project | null> {
    let client;

    try {
        client = await getWeaviateClient();

        const projectCollection = client.collections.get('Project');
        const result = await projectCollection.query.fetchObjectById(projectId);

        if (!result) {
            return null;
        }

        return {
            id: result.uuid,
            ...result.properties as Omit<Project, 'id'>
        };
    } catch (error) {
        console.error(`Error getting project with ID ${projectId}:`, error);
        return null;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Get projects by organization ID
 */
export async function getProjectsByOrgId(clerkOrgId: string): Promise<Project[]> {
    let client;

    try {
        client = await getWeaviateClient();

        const projectCollection = client.collections.get('Project');

        // Create filter using the Filter helper
        const filter = projectCollection.filter.byProperty('clerkOrgId').equal(clerkOrgId);

        const results = await projectCollection.query.fetchObjects({
            filter
        });

        if (!results.objects || results.objects.length === 0) {
            return [];
        }

        return results.objects.map(obj => ({
            id: obj.uuid,
            ...obj.properties as Omit<Project, 'id'>
        }));
    } catch (error) {
        console.error(`Error getting projects for organization ${clerkOrgId}:`, error);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Delete an object by class name and ID
 */
export async function deleteObject(className: string, id: string): Promise<boolean> {
    let client;

    try {
        client = await getWeaviateClient();

        const collection = client.collections.get(className);
        await collection.data.deleteById(id);

        return true;
    } catch (error) {
        console.error(`Error deleting ${className} with ID ${id}:`, error);
        return false;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Get a worker by ID
 */
export async function getWorkerById(workerId: string): Promise<Worker | null> {
    let client;

    try {
        client = await getWeaviateClient();

        const workerCollection = client.collections.get('Worker');
        const result = await workerCollection.query.fetchObjectById(workerId);

        if (!result) {
            return null;
        }

        return {
            id: result.uuid,
            ...result.properties as Omit<Worker, 'id'>
        };
    } catch (error) {
        console.error(`Error getting worker with ID ${workerId}:`, error);
        return null;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Get workers by subcontractor ID
 */
export async function getWorkersBySubcontractorId(subcontractorId: string): Promise<Worker[]> {
    let client;

    try {
        client = await getWeaviateClient();

        const workerCollection = client.collections.get('Worker');

        // Create filter using the Filter helper
        const filter = workerCollection.filter.byProperty('subcontractorId').equal(subcontractorId);

        const results = await workerCollection.query.fetchObjects({
            filter
        });

        if (!results.objects || results.objects.length === 0) {
            return [];
        }

        return results.objects.map(obj => ({
            id: obj.uuid,
            ...obj.properties as Omit<Worker, 'id'>
        }));
    } catch (error) {
        console.error(`Error getting workers for subcontractor ${subcontractorId}:`, error);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}

/**
 * Get reports by project ID
 */
export async function getReportsByProjectId(projectId: string): Promise<Report[]> {
    let client;

    try {
        client = await getWeaviateClient();

        const reportCollection = client.collections.get('Report');

        // Create filter using the Filter helper
        const filter = reportCollection.filter.byProperty('projectId').equal(projectId);

        const results = await reportCollection.query.fetchObjects({
            filter
        });

        if (!results.objects || results.objects.length === 0) {
            return [];
        }

        return results.objects.map(obj => ({
            id: obj.uuid,
            ...obj.properties as Omit<Report, 'id'>
        }));
    } catch (error) {
        console.error(`Error getting reports for project ${projectId}:`, error);
        return [];
    } finally {
        if (client) {
            await client.close();
        }
    }
}