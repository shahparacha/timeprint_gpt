// app/actions/blueprints.ts
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir } from 'fs/promises';
import { getWeaviateClient } from "@/lib/weaviate/client";

export async function getBlueprints() {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Blueprint")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    projectId
                    createdAt
                    updatedAt
                `)
                .withSort([{ path: ["createdAt"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Blueprint || result.data.Get.Blueprint.length === 0) {
                return [];
            }

            // Get project names for each blueprint
            const blueprints = [];
            for (const blueprint of result.data.Get.Blueprint) {
                const enhancedBlueprint = {
                    ...blueprint,
                    project: { name: null }
                };

                // Get project name
                try {
                    const projectResult = await client.graphql
                        .get()
                        .withClassName("Project")
                        .withFields("name")
                        .withWhere({
                            operator: "Equal",
                            path: ["id"],
                            valueString: blueprint.projectId
                        })
                        .do();

                    if (projectResult.data?.Get?.Project?.length > 0) {
                        enhancedBlueprint.project = {
                            name: projectResult.data.Get.Project[0].name
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching project for blueprint ${blueprint.id}:`, error);
                }

                blueprints.push(enhancedBlueprint);
            }

            return blueprints;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching blueprints:', error);
        throw new Error('Failed to fetch blueprints');
    }
}

export async function getBlueprintById(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Blueprint")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    projectId
                    createdAt
                    updatedAt
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Blueprint || result.data.Get.Blueprint.length === 0) {
                return null;
            }

            const blueprint = result.data.Get.Blueprint[0];
            const enhancedBlueprint = {
                ...blueprint,
                project: { name: null }
            };

            // Get project name
            try {
                const projectResult = await client.graphql
                    .get()
                    .withClassName("Project")
                    .withFields("name")
                    .withWhere({
                        operator: "Equal",
                        path: ["id"],
                        valueString: blueprint.projectId
                    })
                    .do();

                if (projectResult.data?.Get?.Project?.length > 0) {
                    enhancedBlueprint.project = {
                        name: projectResult.data.Get.Project[0].name
                    };
                }
            } catch (error) {
                console.error(`Error fetching project for blueprint ${id}:`, error);
            }

            return enhancedBlueprint;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching blueprint ${id}:`, error);
        throw new Error('Failed to fetch blueprint');
    }
}

export async function getBlueprintsByProjectId(projectId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Blueprint")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    createdAt
                    updatedAt
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["projectId"],
                    valueString: projectId
                })
                .withSort([{ path: ["createdAt"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Blueprint || result.data.Get.Blueprint.length === 0) {
                return [];
            }

            return result.data.Get.Blueprint.map(blueprint => ({
                ...blueprint,
                projectId
            }));
        } finally {
            await client.close();
        }
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

        // Get Weaviate client
        const client = await getWeaviateClient();
        const now = new Date().toISOString();

        try {
            // Create blueprint object using data creator
            const result = await client.data
                .creator()
                .withClassName("Blueprint")
                .withProperties({
                    title,
                    filePath: publicFilePath,
                    fileType,
                    fileSize,
                    projectId,
                    createdAt: now,
                    updatedAt: now
                })
                .do();

            const blueprintId = result.id;

            // Create reference from blueprint to project
            await client.data.referenceCreator()
                .withClassName("Blueprint")
                .withId(blueprintId)
                .withReferenceProperty("project")
                .withReference({
                    beacon: `weaviate://localhost/Project/${projectId}`
                })
                .do();

            // Add blueprint to project's blueprints collection
            await client.data.referenceCreator()
                .withClassName("Project")
                .withId(projectId)
                .withReferenceProperty("blueprints")
                .withReference({
                    beacon: `weaviate://localhost/Blueprint/${blueprintId}`
                })
                .do();

            revalidatePath('/blueprints');
            revalidatePath(`/projects/${projectId}`);

            return blueprintId;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error creating blueprint:', error);
        throw new Error('Failed to create blueprint');
    }
}

export async function updateBlueprint(id: string, formData: FormData) {
    try {
        // Get the current blueprint
        const currentBlueprint = await getBlueprintById(id);

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

        // Get Weaviate client
        const client = await getWeaviateClient();
        const now = new Date().toISOString();

        try {
            // Update the blueprint properties
            await client.data
                .updater()
                .withClassName("Blueprint")
                .withId(id)
                .withProperties({
                    title,
                    filePath,
                    fileType,
                    fileSize,
                    projectId,
                    updatedAt: now
                })
                .do();

            // If project changed, update references
            if (projectId !== currentBlueprint.projectId) {
                // First delete the old references

                // 1. Remove reference from blueprint to old project
                await client.data.referenceDeleter()
                    .withClassName("Blueprint")
                    .withId(id)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${currentBlueprint.projectId}`
                    })
                    .do();

                // 2. Remove reference from old project to blueprint
                await client.data.referenceDeleter()
                    .withClassName("Project")
                    .withId(currentBlueprint.projectId)
                    .withReferenceProperty("blueprints")
                    .withReference({
                        beacon: `weaviate://localhost/Blueprint/${id}`
                    })
                    .do();

                // 3. Add reference from blueprint to new project
                await client.data.referenceCreator()
                    .withClassName("Blueprint")
                    .withId(id)
                    .withReferenceProperty("project")
                    .withReference({
                        beacon: `weaviate://localhost/Project/${projectId}`
                    })
                    .do();

                // 4. Add reference from new project to blueprint
                await client.data.referenceCreator()
                    .withClassName("Project")
                    .withId(projectId)
                    .withReferenceProperty("blueprints")
                    .withReference({
                        beacon: `weaviate://localhost/Blueprint/${id}`
                    })
                    .do();
            }

            revalidatePath(`/blueprints/${id}`);
            revalidatePath('/blueprints');

            // Revalidate related paths if project changed
            if (projectId !== currentBlueprint.projectId) {
                revalidatePath(`/projects/${currentBlueprint.projectId}`);
                revalidatePath(`/projects/${projectId}`);
            }
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error updating blueprint ${id}:`, error);
        throw new Error('Failed to update blueprint');
    }
}

export async function deleteBlueprint(id: string) {
    try {
        // Get the blueprint to get the projectId before deleting
        const blueprint = await getBlueprintById(id);

        if (!blueprint) {
            throw new Error('Blueprint not found');
        }

        // Get Weaviate client
        const client = await getWeaviateClient();

        try {
            // Delete the blueprint
            await client.data
                .deleter()
                .withClassName("Blueprint")
                .withId(id)
                .do();

            // TODO: Delete the actual file if needed

            revalidatePath('/blueprints');
            revalidatePath(`/projects/${blueprint.projectId}`);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error deleting blueprint ${id}:`, error);
        throw new Error('Failed to delete blueprint');
    }
}