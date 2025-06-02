import { revalidatePath } from 'next/cache';
import { writeFile, unlink, access } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir } from 'fs/promises';
import { getWeaviateClient } from '@/lib/weaviate/client';

export async function getWorkerIdentificationsByWorkerId(workerId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("WorkerIdentification")
                .withFields(`
                    id
                    fileName
                    filePath
                    fileType
                    fileSize
                    issueDate
                    expiryDate
                    workerId
                    createdAt
                    updatedAt
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["workerId"],
                    valueString: workerId
                })
                .withSort([{ path: ["createdAt"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.WorkerIdentification || result.data.Get.WorkerIdentification.length === 0) {
                return [];
            }

            return result.data.Get.WorkerIdentification;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching identifications for worker ${workerId}:`, error);
        throw new Error('Failed to fetch identifications');
    }
}

export async function getWorkerIdentificationById(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("WorkerIdentification")
                .withFields(`
                    id
                    fileName
                    filePath
                    fileType
                    fileSize
                    issueDate
                    expiryDate
                    workerId
                    createdAt
                    updatedAt
                    worker {
                        ... on Worker {
                            id
                            firstName
                            lastName
                            email
                            phone
                            subcontractorId
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

            if (!result.data || !result.data.Get || !result.data.Get.WorkerIdentification || result.data.Get.WorkerIdentification.length === 0) {
                return null;
            }

            return result.data.Get.WorkerIdentification[0];
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching worker identification ${id}:`, error);
        throw new Error('Failed to fetch worker identification');
    }
}

// Helper function to delete a file if it exists
async function deleteFileIfExists(filePath: string): Promise<boolean> {
    try {
        // Get the full path to the file in the public directory
        const fullPath = path.join(process.cwd(), 'public', filePath);

        // Check if file exists
        await access(fullPath);

        // Delete the file
        await unlink(fullPath);
        console.log(`File deleted: ${fullPath}`);
        return true;
    } catch (error) {
        // File doesn't exist or couldn't be deleted
        console.error(`Error deleting file ${filePath}:`, error);
        return false;
    }
}

export async function createWorkerIdentification(formData: FormData) {
    try {
        // Extract and validate required fields
        const fileName = formData.get('fileName') as string;
        const workerId = formData.get('workerId') as string;
        const file = formData.get('file') as File;

        if (!fileName || !workerId || !file) {
            throw new Error('File name, worker ID, and file are required');
        }

        // Get file information
        const fileType = file.type;
        const fileSize = file.size;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'identifications');
        await mkdir(uploadsDir, { recursive: true });

        // Generate a unique filename using crypto.randomUUID()
        const uniqueFilename = `${randomUUID()}-${file.name}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Save the file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Create a web-accessible path
        const publicFilePath = `/uploads/identifications/${uniqueFilename}`;

        // Extract optional fields
        const issueDateStr = formData.get('issueDate') as string;
        const expiryDateStr = formData.get('expiryDate') as string;

        const issueDate = issueDateStr ? new Date(issueDateStr).toISOString() : null;
        const expiryDate = expiryDateStr ? new Date(expiryDateStr).toISOString() : null;

        // Get Weaviate client
        const client = await getWeaviateClient();
        const now = new Date().toISOString();

        try {
            // Create worker identification object
            const result = await client.data
                .creator()
                .withClassName("WorkerIdentification")
                .withProperties({
                    fileName,
                    filePath: publicFilePath,
                    fileType,
                    fileSize,
                    issueDate,
                    expiryDate,
                    workerId,
                    createdAt: now,
                    updatedAt: now
                })
                .do();

            const identificationId = result.id;

            // Create reference from identification to worker
            await client.data.referenceCreator()
                .withClassName("WorkerIdentification")
                .withId(identificationId)
                .withReferenceProperty("worker")
                .withReference({
                    beacon: `weaviate://localhost/Worker/${workerId}`
                })
                .do();

            // Add identification to worker's identifications collection
            await client.data.referenceCreator()
                .withClassName("Worker")
                .withId(workerId)
                .withReferenceProperty("identifications")
                .withReference({
                    beacon: `weaviate://localhost/WorkerIdentification/${identificationId}`
                })
                .do();

            revalidatePath(`/workers/${workerId}`);

            return identificationId;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error creating worker identification:', error);
        throw new Error('Failed to create worker identification');
    }
}

export async function updateWorkerIdentification(id: string, formData: FormData) {
    try {
        // Get the current identification
        const currentIdentification = await getWorkerIdentificationById(id);

        if (!currentIdentification) {
            throw new Error('Worker identification not found');
        }

        // Extract and validate required fields
        const fileName = formData.get('fileName') as string;

        if (!fileName) {
            throw new Error('File name is required');
        }

        // Check if a new file was uploaded
        const file = formData.get('file') as File | null;
        let fileType = currentIdentification.fileType;
        let fileSize = currentIdentification.fileSize;
        let filePath = currentIdentification.filePath;

        if (file && file.size > 0) {
            // Get file information
            fileType = file.type;
            fileSize = file.size;

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'identifications');
            await mkdir(uploadsDir, { recursive: true });

            // Generate a unique filename using crypto.randomUUID()
            const uniqueFilename = `${randomUUID()}-${file.name}`;
            const newFilePath = path.join(uploadsDir, uniqueFilename);

            // Save the file
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(newFilePath, buffer);

            // Create a web-accessible path
            const newPublicFilePath = `/uploads/identifications/${uniqueFilename}`;

            // Delete the old file before updating the path
            await deleteFileIfExists(currentIdentification.filePath);

            // Update the file path
            filePath = newPublicFilePath;
        }

        // Extract optional fields
        const issueDateStr = formData.get('issueDate') as string;
        const expiryDateStr = formData.get('expiryDate') as string;

        const issueDate = issueDateStr ? new Date(issueDateStr).toISOString() : null;
        const expiryDate = expiryDateStr ? new Date(expiryDateStr).toISOString() : null;

        // Get Weaviate client
        const client = await getWeaviateClient();
        const now = new Date().toISOString();

        try {
            // Update worker identification
            await client.data
                .updater()
                .withClassName("WorkerIdentification")
                .withId(id)
                .withProperties({
                    fileName,
                    filePath,
                    fileType,
                    fileSize,
                    issueDate,
                    expiryDate,
                    updatedAt: now
                })
                .do();

            revalidatePath(`/workers/${currentIdentification.workerId}`);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error updating worker identification ${id}:`, error);
        throw new Error('Failed to update worker identification');
    }
}

export async function deleteWorkerIdentification(id: string) {
    try {
        // Get the worker ID and file path before deleting
        const identification = await getWorkerIdentificationById(id);

        if (!identification) {
            throw new Error('Worker identification not found');
        }

        // Delete the actual file from the filesystem
        await deleteFileIfExists(identification.filePath);

        // Get Weaviate client
        const client = await getWeaviateClient();

        try {
            // Remove reference from worker to identification first
            await client.data.referenceDeleter()
                .withClassName("Worker")
                .withId(identification.workerId)
                .withReferenceProperty("identifications")
                .withReference({
                    beacon: `weaviate://localhost/WorkerIdentification/${id}`
                })
                .do();

            // Delete the identification record
            await client.data
                .deleter()
                .withClassName("WorkerIdentification")
                .withId(id)
                .do();

            revalidatePath(`/workers/${identification.workerId}`);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error deleting worker identification ${id}:`, error);
        throw new Error('Failed to delete worker identification');
    }
}