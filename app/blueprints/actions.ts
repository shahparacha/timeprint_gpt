'use server';

import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir } from 'fs/promises';
import { db } from "@/lib/db";

export async function getBlueprints() {
    try {
        const blueprints = await db.blueprint.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return blueprints;
    } catch (error) {
        console.error('Error fetching blueprints:', error);
        throw new Error('Failed to fetch blueprints');
    }
}

export async function getBlueprintById(id: string) {
    try {
        const blueprint = await db.blueprint.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return blueprint;
    } catch (error) {
        console.error(`Error fetching blueprint ${id}:`, error);
        throw new Error('Failed to fetch blueprint');
    }
}

export async function getBlueprintsByProjectId(projectId: string) {
    try {
        const blueprints = await db.blueprint.findMany({
            where: {
                projectId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return blueprints;
    } catch (error) {
        console.error(`Error fetching blueprints for project ${projectId}:`, error);
        throw new Error('Failed to fetch blueprints');
    }
}

export async function createBlueprint(formData: FormData) {
    try {
        // Extract and validate required fields
        const title = formData.get('title') as string;
        const projectId = formData.get('projectId') as string;
        const file = formData.get('file') as File;

        if (!title || !projectId || !file) {
            throw new Error('Title, project ID, and file are required');
        }

        // Get file information
        const fileType = file.type;
        const fileSize = file.size;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blueprints');
        await mkdir(uploadsDir, { recursive: true });

        // Generate a unique filename using crypto.randomUUID()
        const uniqueFilename = `${randomUUID()}-${file.name}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        // Save the file
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Create a web-accessible path
        const publicFilePath = `/uploads/blueprints/${uniqueFilename}`;

        // Create the blueprint record
        const blueprint = await db.blueprint.create({
            data: {
                title,
                filePath: publicFilePath,
                fileType,
                fileSize,
                projectId,
            },
        });

        revalidatePath('/blueprints');
        revalidatePath(`/projects/${projectId}`);

        return blueprint.id;
    } catch (error) {
        console.error('Error creating blueprint:', error);
        throw new Error('Failed to create blueprint');
    }
}

export async function updateBlueprint(id: string, formData: FormData) {
    try {
        // Get the current blueprint
        const currentBlueprint = await db.blueprint.findUnique({
            where: { id },
        });

        if (!currentBlueprint) {
            throw new Error('Blueprint not found');
        }

        // Extract and validate required fields
        const title = formData.get('title') as string;
        const projectId = formData.get('projectId') as string;

        if (!title || !projectId) {
            throw new Error('Title and project ID are required');
        }

        // Check if a new file was uploaded
        const file = formData.get('file') as File | null;
        let fileType = currentBlueprint.fileType;
        let fileSize = currentBlueprint.fileSize;
        let filePath = currentBlueprint.filePath;

        if (file && file.size > 0) {
            // Get file information
            fileType = file.type;
            fileSize = file.size;

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'blueprints');
            await mkdir(uploadsDir, { recursive: true });

            // Generate a unique filename using crypto.randomUUID()
            const uniqueFilename = `${randomUUID()}-${file.name}`;
            const newFilePath = path.join(uploadsDir, uniqueFilename);

            // Save the file
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(newFilePath, buffer);

            // Create a web-accessible path
            filePath = `/uploads/blueprints/${uniqueFilename}`;

            // TODO: Delete the old file if needed
        }

        // Update the blueprint record
        await db.blueprint.update({
            where: { id },
            data: {
                title,
                filePath,
                fileType,
                fileSize,
                projectId,
            },
        });

        revalidatePath(`/blueprints/${id}`);
        revalidatePath('/blueprints');

        // Revalidate related paths if project changed
        if (projectId !== currentBlueprint.projectId) {
            revalidatePath(`/projects/${currentBlueprint.projectId}`);
            revalidatePath(`/projects/${projectId}`);
        }
    } catch (error) {
        console.error(`Error updating blueprint ${id}:`, error);
        throw new Error('Failed to update blueprint');
    }
}

export async function deleteBlueprint(id: string) {
    try {
        // Get the blueprint to get the projectId before deleting
        const blueprint = await db.blueprint.findUnique({
            where: { id },
            select: {
                projectId: true,
                filePath: true,
            },
        });

        if (!blueprint) {
            throw new Error('Blueprint not found');
        }

        // Delete the blueprint record
        await db.blueprint.delete({
            where: { id },
        });

        // TODO: Delete the actual file if needed

        revalidatePath('/blueprints');
        revalidatePath(`/projects/${blueprint.projectId}`);
    } catch (error) {
        console.error(`Error deleting blueprint ${id}:`, error);
        throw new Error('Failed to delete blueprint');
    }
}