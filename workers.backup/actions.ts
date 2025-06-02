'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getWeaviateClient } from '@/lib/weaviate/client';

// Basic function without redirect - for database operations only
export async function createWorker(formData: FormData) {
    try {
        // Extract worker data
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = (formData.get('email') as string) || null;
        const phone = (formData.get('phone') as string) || null;
        const subcontractorId = formData.get('subcontractorId') as string;

        // Validate required fields
        if (!firstName || !lastName || !subcontractorId) {
            throw new Error('First name, last name, and subcontractor are required');
        }

        // Handle projectIds (optional)
        const projectIds = formData.getAll('projectIds') as string[];

        const client = await getWeaviateClient();
        const now = new Date().toISOString();

        try {
            // Create the worker
            const result = await client.data
                .creator()
                .withClassName("Worker")
                .withProperties({
                    firstName,
                    lastName,
                    email,
                    phone,
                    subcontractorId,
                    createdAt: now,
                    updatedAt: now
                })
                .do();

            const workerId = result.id;

            // Create reference from worker to subcontractor
            await client.data.referenceCreator()
                .withClassName("Worker")
                .withId(workerId)
                .withReferenceProperty("subcontractor")
                .withReference({
                    beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
                })
                .do();

            // Add worker to subcontractor's workers collection
            await client.data.referenceCreator()
                .withClassName("Subcontractor")
                .withId(subcontractorId)
                .withReferenceProperty("workers")
                .withReference({
                    beacon: `weaviate://localhost/Worker/${workerId}`
                })
                .do();

            // If projects were selected, create the worker-project connections
            if (projectIds.length > 0) {
                for (const projectId of projectIds) {
                    // Create junction object
                    const junctionResult = await client.data
                        .creator()
                        .withClassName("WorkerProject")
                        .withProperties({
                            workerId: workerId,
                            projectId: projectId,
                            assignedAt: now
                        })
                        .do();

                    const junctionId = junctionResult.id;

                    // Create references
                    await client.data.referenceCreator()
                        .withClassName("WorkerProject")
                        .withId(junctionId)
                        .withReferenceProperty("worker")
                        .withReference({
                            beacon: `weaviate://localhost/Worker/${workerId}`
                        })
                        .do();

                    await client.data.referenceCreator()
                        .withClassName("WorkerProject")
                        .withId(junctionId)
                        .withReferenceProperty("project")
                        .withReference({
                            beacon: `weaviate://localhost/Project/${projectId}`
                        })
                        .do();

                    // Add reference from worker to junction
                    await client.data.referenceCreator()
                        .withClassName("Worker")
                        .withId(workerId)
                        .withReferenceProperty("projects")
                        .withReference({
                            beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                        })
                        .do();

                    // Add reference from project to junction
                    await client.data.referenceCreator()
                        .withClassName("Project")
                        .withId(projectId)
                        .withReferenceProperty("workers")
                        .withReference({
                            beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                        })
                        .do();
                }
            }

            // Refresh worker list 
            revalidatePath('/workers');

            // Return the worker ID
            return workerId;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error creating worker:', error);
        throw error; // Re-throw the original error for better debugging
    }
}

// Separate function that includes redirect - use this in your form
export async function createWorkerAndRedirect(formData: FormData) {
    try {
        await createWorker(formData);
        // Redirect to the workers listing page
        redirect('/workers');
    } catch (error) {
        console.error("Error in worker creation:", error);
        throw error;
    }
}

export async function getWorkersBySubcontractorId(subcontractorId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Worker")
                .withFields(`
                    id
                    firstName
                    lastName
                    email
                    phone
                    subcontractorId
                    createdAt
                    updatedAt
                    projects {
                        ... on WorkerProject {
                            assignedAt
                            project {
                                ... on Project {
                                    id
                                    name
                                }
                            }
                        }
                    }
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["subcontractorId"],
                    valueString: subcontractorId
                })
                .withSort([
                    { path: ["lastName"], order: "asc" },
                    { path: ["firstName"], order: "asc" }
                ])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Worker || result.data.Get.Worker.length === 0) {
                return [];
            }

            return result.data.Get.Worker;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching workers for subcontractor ${subcontractorId}:`, error);
        throw error;
    }
}

// Other worker-related functions...
export async function getWorkers() {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Worker")
                .withFields(`
                    id
                    firstName
                    lastName
                    email
                    phone
                    subcontractorId
                    createdAt
                    updatedAt
                    projects {
                        ... on WorkerProject {
                            assignedAt
                            project {
                                ... on Project {
                                    id
                                    name
                                }
                            }
                        }
                    }
                    subcontractor {
                        ... on Subcontractor {
                            id
                            name
                        }
                    }
                `)
                .withSort([
                    { path: ["lastName"], order: "asc" },
                    { path: ["firstName"], order: "asc" }
                ])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Worker || result.data.Get.Worker.length === 0) {
                return [];
            }

            return result.data.Get.Worker;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching workers:', error);
        throw error;
    }
}

export async function getWorkerById(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Worker")
                .withFields(`
                    id
                    firstName
                    lastName
                    email
                    phone
                    subcontractorId
                    createdAt
                    updatedAt
                    projects {
                        ... on WorkerProject {
                            id
                            assignedAt
                            project {
                                ... on Project {
                                    id
                                    name
                                    description
                                    address
                                    city
                                    state
                                    country
                                    zipCode
                                    clerkOrgId
                                    createdAt
                                    updatedAt
                                }
                            }
                        }
                    }
                    subcontractor {
                        ... on Subcontractor {
                            id
                            name
                            contactName
                            email
                            phone
                            address
                            unitNumber
                            city
                            state
                            country
                            zipCode
                            taxId
                            createdAt
                            updatedAt
                        }
                    }
                    identifications {
                        ... on WorkerIdentification {
                            id
                            fileName
                            filePath
                            fileType
                            fileSize
                            issueDate
                            expiryDate
                            createdAt
                            updatedAt
                        }
                    }
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Worker || result.data.Get.Worker.length === 0) {
                return null;
            }

            return result.data.Get.Worker[0];
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching worker ${id}:`, error);
        throw new Error('Failed to fetch worker');
    }
}

export async function updateWorker(id: string, formData: FormData) {
    // Extract worker data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = (formData.get('email') as string) || null;
    const phone = (formData.get('phone') as string) || null;
    const subcontractorId = formData.get('subcontractorId') as string;

    // Validate required fields
    if (!firstName || !lastName || !subcontractorId) {
        throw new Error('First name, last name, and subcontractor are required');
    }

    // Handle projectIds (optional)
    const projectIds = formData.getAll('projectIds') as string[];

    // Get current worker data to check for changes
    const currentWorker = await getWorkerById(id);
    if (!currentWorker) {
        throw new Error('Worker not found');
    }

    const client = await getWeaviateClient();
    const now = new Date().toISOString();

    try {
        // Update the worker properties
        await client.data
            .updater()
            .withClassName("Worker")
            .withId(id)
            .withProperties({
                firstName,
                lastName,
                email,
                phone,
                subcontractorId,
                updatedAt: now
            })
            .do();

        // If subcontractor changed, update references
        if (subcontractorId !== currentWorker.subcontractorId) {
            // Remove reference from old subcontractor
            await client.data.referenceDeleter()
                .withClassName("Subcontractor")
                .withId(currentWorker.subcontractorId)
                .withReferenceProperty("workers")
                .withReference({
                    beacon: `weaviate://localhost/Worker/${id}`
                })
                .do();

            // Remove reference from worker to old subcontractor
            await client.data.referenceDeleter()
                .withClassName("Worker")
                .withId(id)
                .withReferenceProperty("subcontractor")
                .withReference({
                    beacon: `weaviate://localhost/Subcontractor/${currentWorker.subcontractorId}`
                })
                .do();

            // Add reference from worker to new subcontractor
            await client.data.referenceCreator()
                .withClassName("Worker")
                .withId(id)
                .withReferenceProperty("subcontractor")
                .withReference({
                    beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
                })
                .do();

            // Add reference from new subcontractor to worker
            await client.data.referenceCreator()
                .withClassName("Subcontractor")
                .withId(subcontractorId)
                .withReferenceProperty("workers")
                .withReference({
                    beacon: `weaviate://localhost/Worker/${id}`
                })
                .do();
        }

        // Handle projects
        // First, get the existing WorkerProject objects
        const existingResult = await client.graphql
            .get()
            .withClassName("WorkerProject")
            .withFields("id projectId")
            .withWhere({
                operator: "Equal",
                path: ["workerId"],
                valueString: id
            })
            .do();

        // Delete all existing worker-project relationships
        if (existingResult.data?.Get?.WorkerProject?.length > 0) {
            for (const workerProject of existingResult.data.Get.WorkerProject) {
                await client.data.deleter()
                    .withClassName("WorkerProject")
                    .withId(workerProject.id)
                    .do();
            }
        }

        // If projects were selected, create new connections
        if (projectIds.length > 0) {
            // Check if subcontractor needs to be added to projects
            const subcontractorResult = await client.graphql
                .get()
                .withClassName("SubcontractorProject")
                .withFields("projectId")
                .withWhere({
                    operator: "Equal",
                    path: ["subcontractorId"],
                    valueString: subcontractorId
                })
                .do();

            // Get existing project IDs for the subcontractor
            const existingProjectIds = subcontractorResult.data?.Get?.SubcontractorProject?.map(sp => sp.projectId) || [];

            // Find projects that need to be added to the subcontractor
            const projectsToAdd = projectIds.filter(id => !existingProjectIds.includes(id));

            // Add new projects to the subcontractor if needed
            for (const projectId of projectsToAdd) {
                // Create junction object
                const junctionResult = await client.data
                    .creator()
                    .withClassName("SubcontractorProject")
                    .withProperties({
                        subcontractorId: subcontractorId,
                        projectId: projectId,
                        assignedAt: now
                    })
                    .do();

                const junctionId = junctionResult.id;

                // Create references
                await client.data.referenceCreator()
                    .withClassName("SubcontractorProject")
                    .withId(junctionId)
                    .withReferenceProperty("subcontractor")
                    .withReference({
                        beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
                    })
                    .do();

                await client.data.referenceCreator()
                    .withClassName("SubcontractorProject")
                    .withId(junctionId)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${projectId}`
                    })
                    .do();

                // Add reference from subcontractor to junction
                await client.data.referenceCreator()
                    .withClassName("Subcontractor")
                    .withId(subcontractorId)
                    .withReferenceProperty("projects")
                    .withReference({
                        beacon: `weaviate://localhost/SubcontractorProject/${junctionId}`
                    })
                    .do();

                // Add reference from project to junction
                await client.data.referenceCreator()
                    .withClassName("Project")
                    .withId(projectId)
                    .withReferenceProperty("subcontractors")
                    .withReference({
                        beacon: `weaviate://localhost/SubcontractorProject/${junctionId}`
                    })
                    .do();

                // Revalidate project paths for newly added projects
                revalidatePath(`/projects/${projectId}`);
            }

            // Create worker-project connections for all selected projects
            for (const projectId of projectIds) {
                // Create junction object
                const junctionResult = await client.data
                    .creator()
                    .withClassName("WorkerProject")
                    .withProperties({
                        workerId: id,
                        projectId: projectId,
                        assignedAt: now
                    })
                    .do();

                const junctionId = junctionResult.id;

                // Create references
                await client.data.referenceCreator()
                    .withClassName("WorkerProject")
                    .withId(junctionId)
                    .withReferenceProperty("worker")
                    .withReference({
                        beacon: `weaviate://localhost/Worker/${id}`
                    })
                    .do();

                await client.data.referenceCreator()
                    .withClassName("WorkerProject")
                    .withId(junctionId)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${projectId}`
                    })
                    .do();

                // Add reference from worker to junction
                await client.data.referenceCreator()
                    .withClassName("Worker")
                    .withId(id)
                    .withReferenceProperty("projects")
                    .withReference({
                        beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                    })
                    .do();

                // Add reference from project to junction
                await client.data.referenceCreator()
                    .withClassName("Project")
                    .withId(projectId)
                    .withReferenceProperty("workers")
                    .withReference({
                        beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                    })
                    .do();
            }
        }

        // Revalidate paths
        revalidatePath(`/workers/${id}`);
        revalidatePath('/workers');
        revalidatePath('/subcontractors');
        revalidatePath(`/subcontractors/${subcontractorId}`);
        if (subcontractorId !== currentWorker.subcontractorId) {
            revalidatePath(`/subcontractors/${currentWorker.subcontractorId}`);
        }
    } finally {
        await client.close();
    }

    redirect('/workers');
}

export async function deleteWorker(id: string) {
    try {
        // Get worker data before deletion to handle references
        const worker = await getWorkerById(id);

        if (!worker) {
            throw new Error('Worker not found');
        }

        const client = await getWeaviateClient();

        try {
            // 1. Delete worker identifications
            if (worker.identifications && worker.identifications.length > 0) {
                for (const identification of worker.identifications) {
                    await client.data.deleter()
                        .withClassName("WorkerIdentification")
                        .withId(identification.id)
                        .do();
                }
            }

            // 2. Delete worker-project associations
            if (worker.projects && worker.projects.length > 0) {
                for (const workerProject of worker.projects) {
                    await client.data.deleter()
                        .withClassName("WorkerProject")
                        .withId(workerProject.id)
                        .do();
                }
            }

            // 3. Remove reference from subcontractor to worker
            await client.data.referenceDeleter()
                .withClassName("Subcontractor")
                .withId(worker.subcontractorId)
                .withReferenceProperty("workers")
                .withReference({
                    beacon: `weaviate://localhost/Worker/${id}`
                })
                .do();

            // 4. Delete the worker
            await client.data.deleter()
                .withClassName("Worker")
                .withId(id)
                .do();

            revalidatePath('/workers');
            revalidatePath(`/subcontractors/${worker.subcontractorId}`);

            // Revalidate project paths if needed
            if (worker.projects && worker.projects.length > 0) {
                for (const workerProject of worker.projects) {
                    revalidatePath(`/projects/${workerProject.project.id}`);
                }
            }
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error deleting worker ${id}:`, error);
        throw new Error('Failed to delete worker');
    }
}

// New function with auto-assignment of projects to subcontractor
export async function createWorkerWithRedirect(formData: FormData) {
    // Extract worker data
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = (formData.get('email') as string) || null;
    const phone = (formData.get('phone') as string) || null;
    const subcontractorId = formData.get('subcontractorId') as string;

    // Validate required fields
    if (!firstName || !lastName || !subcontractorId) {
        throw new Error('First name, last name, and subcontractor are required');
    }

    // Handle projectIds (optional)
    const projectIds = formData.getAll('projectIds') as string[];

    const client = await getWeaviateClient();
    const now = new Date().toISOString();

    try {
        // Create the worker
        const result = await client.data
            .creator()
            .withClassName("Worker")
            .withProperties({
                firstName,
                lastName,
                email,
                phone,
                subcontractorId,
                createdAt: now,
                updatedAt: now
            })
            .do();

        const workerId = result.id;

        // Create reference from worker to subcontractor
        await client.data.referenceCreator()
            .withClassName("Worker")
            .withId(workerId)
            .withReferenceProperty("subcontractor")
            .withReference({
                beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
            })
            .do();

        // Add worker to subcontractor's workers collection
        await client.data.referenceCreator()
            .withClassName("Subcontractor")
            .withId(subcontractorId)
            .withReferenceProperty("workers")
            .withReference({
                beacon: `weaviate://localhost/Worker/${workerId}`
            })
            .do();

        // If projects were selected
        if (projectIds.length > 0) {
            // Check if subcontractor needs to be added to projects
            const subcontractorResult = await client.graphql
                .get()
                .withClassName("SubcontractorProject")
                .withFields("projectId")
                .withWhere({
                    operator: "Equal",
                    path: ["subcontractorId"],
                    valueString: subcontractorId
                })
                .do();

            // Get existing project IDs for the subcontractor
            const existingProjectIds = subcontractorResult.data?.Get?.SubcontractorProject?.map(sp => sp.projectId) || [];

            // Find projects that need to be added to the subcontractor
            const projectsToAdd = projectIds.filter(id => !existingProjectIds.includes(id));

            // Add new projects to the subcontractor if needed
            for (const projectId of projectsToAdd) {
                // Create junction object
                const junctionResult = await client.data
                    .creator()
                    .withClassName("SubcontractorProject")
                    .withProperties({
                        subcontractorId: subcontractorId,
                        projectId: projectId,
                        assignedAt: now
                    })
                    .do();

                const junctionId = junctionResult.id;

                // Create references
                await client.data.referenceCreator()
                    .withClassName("SubcontractorProject")
                    .withId(junctionId)
                    .withReferenceProperty("subcontractor")
                    .withReference({
                        beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
                    })
                    .do();

                await client.data.referenceCreator()
                    .withClassName("SubcontractorProject")
                    .withId(junctionId)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${projectId}`
                    })
                    .do();

                // Add reference from subcontractor to junction
                await client.data.referenceCreator()
                    .withClassName("Subcontractor")
                    .withId(subcontractorId)
                    .withReferenceProperty("projects")
                    .withReference({
                        beacon: `weaviate://localhost/SubcontractorProject/${junctionId}`
                    })
                    .do();

                // Add reference from project to junction
                await client.data.referenceCreator()
                    .withClassName("Project")
                    .withId(projectId)
                    .withReferenceProperty("subcontractors")
                    .withReference({
                        beacon: `weaviate://localhost/SubcontractorProject/${junctionId}`
                    })
                    .do();

                // Revalidate project paths for newly added projects
                revalidatePath(`/projects/${projectId}`);
            }

            // Create worker-project connections for all selected projects
            for (const projectId of projectIds) {
                // Create junction object
                const junctionResult = await client.data
                    .creator()
                    .withClassName("WorkerProject")
                    .withProperties({
                        workerId: workerId,
                        projectId: projectId,
                        assignedAt: now
                    })
                    .do();

                const junctionId = junctionResult.id;

                // Create references
                await client.data.referenceCreator()
                    .withClassName("WorkerProject")
                    .withId(junctionId)
                    .withReferenceProperty("worker")
                    .withReference({
                        beacon: `weaviate://localhost/Worker/${workerId}`
                    })
                    .do();

                await client.data.referenceCreator()
                    .withClassName("WorkerProject")
                    .withId(junctionId)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${projectId}`
                    })
                    .do();

                // Add reference from worker to junction
                await client.data.referenceCreator()
                    .withClassName("Worker")
                    .withId(workerId)
                    .withReferenceProperty("projects")
                    .withReference({
                        beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                    })
                    .do();

                // Add reference from project to junction
                await client.data.referenceCreator()
                    .withClassName("Project")
                    .withId(projectId)
                    .withReferenceProperty("workers")
                    .withReference({
                        beacon: `weaviate://localhost/WorkerProject/${junctionId}`
                    })
                    .do();
            }
        }

        // Refresh worker and subcontractor lists
        revalidatePath('/workers');
        revalidatePath('/subcontractors');
        revalidatePath(`/subcontractors/${subcontractorId}`);
    } finally {
        await client.close();
    }

    // The redirect must be the last statement with no try/catch blocks
    redirect('/workers');
}