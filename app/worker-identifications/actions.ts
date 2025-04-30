'use server';

import { revalidatePath } from 'next/cache';
import { writeFile, unlink, access } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir } from 'fs/promises';
import { db } from '@/lib/db';

export async function getWorkerIdentificationsByWorkerId(workerId: string) {
    try {
        const identifications = await db.workerIdentification.findMany({
            where: {
                workerId,
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
        });

        return identifications;
    } catch (error) {
        console.error(`Error fetching identifications for worker ${workerId}:`, error);
        throw new Error('Failed to fetch identifications');
    }
}

export async function getWorkerIdentificationById(id: string) {
    try {
        const identification = await db.workerIdentification.findUnique({
            where: { id },
            include: {
                worker: true,
            },
        });

        return identification;
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

        // Generate a unique filename using crypto instead of uuid
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

        const issueDate = issueDateStr ? new Date(issueDateStr) : null;
        const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

        // Create the worker identification record
        const identification = await db.workerIdentification.create({
            data: {
                fileName,
                filePath: publicFilePath,
                fileType,
                fileSize,
                issueDate,
                expiryDate,
                workerId,
            },
        });

        revalidatePath(`/workers/${workerId}`);

        return identification.id;
    } catch (error) {
        console.error('Error creating worker identification:', error);
        throw new Error('Failed to create worker identification');
    }
}

export async function updateWorkerIdentification(id: string, formData: FormData) {
    try {
        // Get the current identification
        const currentIdentification = await db.workerIdentification.findUnique({
            where: { id },
        });

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

            // Generate a unique filename using crypto instead of uuid
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

        const issueDate = issueDateStr ? new Date(issueDateStr) : null;
        const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;

        // Update the worker identification record
        await db.workerIdentification.update({
            where: { id },
            data: {
                fileName,
                filePath,
                fileType,
                fileSize,
                issueDate,
                expiryDate,
            },
        });

        revalidatePath(`/workers/${currentIdentification.workerId}`);
    } catch (error) {
        console.error(`Error updating worker identification ${id}:`, error);
        throw new Error('Failed to update worker identification');
    }
}

export async function deleteWorkerIdentification(id: string) {
    try {
        // Get the worker ID and file path before deleting
        const identification = await db.workerIdentification.findUnique({
            where: { id },
            select: {
                workerId: true,
                filePath: true,
            },
        });

        if (!identification) {
            throw new Error('Worker identification not found');
        }

        // Delete the actual file from the filesystem
        await deleteFileIfExists(identification.filePath);

        // Delete the identification record from the database
        await db.workerIdentification.delete({
            where: { id },
        });

        revalidatePath(`/workers/${identification.workerId}`);
    } catch (error) {
        console.error(`Error deleting worker identification ${id}:`, error);
        throw new Error('Failed to delete worker identification');
    }
}