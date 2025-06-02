'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWeaviateClient } from "@/lib/weaviate/client";

export async function getProjects() {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();
    console.log("Getting projects for organization:", orgId);

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const client = getWeaviateClient();

    try {
        // First check if the 'Project' collection/class exists
        const schemaResponse = await client.schema.getter().do();
        const classExists = schemaResponse.classes?.some(c => c.class === "Project");

        console.log("Project class exists:", classExists);

        if (!classExists) {
            console.log("Project class does not exist - creating it");
            try {
                const classObj = {
                    "class": "Project",
                    "properties": [
                        { "name": "name", "dataType": ["text"] },
                        { "name": "description", "dataType": ["text"] },
                        { "name": "address", "dataType": ["text"] },
                        { "name": "city", "dataType": ["text"] },
                        { "name": "state", "dataType": ["text"] },
                        { "name": "country", "dataType": ["text"] },
                        { "name": "zipCode", "dataType": ["text"] },
                        { "name": "clerkOrgId", "dataType": ["text"] },
                        { "name": "createdAt", "dataType": ["text"] },
                        { "name": "updatedAt", "dataType": ["text"] }
                    ]
                };

                await client.schema.classCreator().withClass(classObj).do();
                console.log("Class created successfully");
                return []; // Return empty array since we just created the collection
            } catch (createError) {
                console.error("Error creating class:", createError);
                return [];
            }
        }

        // Query projects using GraphQL with v2 client
        try {
            // Query for projects with the organization ID
            const result = await client.graphql
                .get()
                .withClassName("Project")
                .withFields("name description address city state country zipCode createdAt updatedAt _additional { id }")
                .withWhere({
                    operator: "Equal",
                    path: ["clerkOrgId"],
                    valueString: orgId
                })
                .withSort([{ path: ["name"], order: "asc" }])
                .do();

            console.log("GraphQL query result:", JSON.stringify(result));

            if (!result.data?.Get?.Project || result.data.Get.Project.length === 0) {
                return [];
            }

            // Transform the results to include id at the top level
            return result.data.Get.Project.map(project => ({
                id: project._additional.id,
                name: project.name || "Unnamed Project",
                description: project.description || "",
                address: project.address || "",
                city: project.city || "",
                state: project.state || "",
                country: project.country || "",
                zipCode: project.zipCode || "",
                createdAt: project.createdAt || new Date().toISOString(),
                updatedAt: project.updatedAt || new Date().toISOString()
            }));
        } catch (queryError) {
            console.error("Error querying collection:", queryError);
            return [];
        }
    } catch (error) {
        console.error('Error in getProjects:', error);
        throw new Error('Failed to fetch projects');
    }
}

export async function createProject(formData: FormData) {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string || "";
    const address = formData.get('address') as string || "";
    const city = formData.get('city') as string || "";
    const state = formData.get('state') as string || "";
    const country = formData.get('country') as string || "";
    const zipCode = formData.get('zipCode') as string || "";

    if (!name) {
        throw new Error("Name is required");
    }

    const client = getWeaviateClient();
    let projectId: string;

    try {
        const now = new Date().toISOString();

        // Check if the Project class exists, create it if it doesn't
        const schemaResponse = await client.schema.getter().do();
        const classExists = schemaResponse.classes?.some(c => c.class === "Project");

        if (!classExists) {
            console.log("Creating Project class");
            const classObj = {
                "class": "Project",
                "properties": [
                    { "name": "name", "dataType": ["text"] },
                    { "name": "description", "dataType": ["text"] },
                    { "name": "address", "dataType": ["text"] },
                    { "name": "city", "dataType": ["text"] },
                    { "name": "state", "dataType": ["text"] },
                    { "name": "country", "dataType": ["text"] },
                    { "name": "zipCode", "dataType": ["text"] },
                    { "name": "clerkOrgId", "dataType": ["text"] },
                    { "name": "createdAt", "dataType": ["text"] },
                    { "name": "updatedAt", "dataType": ["text"] }
                ]
            };

            await client.schema.classCreator().withClass(classObj).do();
            console.log("Class created successfully");
        }

        // Create project in Weaviate using v2 client
        console.log("Creating project with data:", {
            name,
            description,
            address,
            city,
            state,
            country,
            zipCode,
            clerkOrgId: orgId,
            createdAt: now,
            updatedAt: now
        });

        const result = await client.data
            .creator()
            .withClassName("Project")
            .withProperties({
                name,
                description,
                address,
                city,
                state,
                country,
                zipCode,
                clerkOrgId: orgId, // Make sure to include this
                createdAt: now,
                updatedAt: now
            })
            .do();

        console.log("Create result:", result);
        projectId = result.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw new Error('Failed to create project');
    }

    // These must be outside the try/catch block
    revalidatePath('/projects');
    redirect(`/projects/${projectId}`);
}

export async function updateProject(projectId: string, formData: FormData) {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string || "";
    const address = formData.get('address') as string || "";
    const city = formData.get('city') as string || "";
    const state = formData.get('state') as string || "";
    const country = formData.get('country') as string || "";
    const zipCode = formData.get('zipCode') as string || "";

    if (!name) {
        throw new Error("Name is required");
    }

    const client = getWeaviateClient();

    try {
        // First, fetch the existing project to get all its properties
        const existingProjectResult = await client.graphql
            .get()
            .withClassName("Project")
            .withFields("name description address city state country zipCode clerkOrgId createdAt _additional { id }")
            .withWhere({
                operator: "Equal",
                path: ["_id"],
                valueString: projectId
            })
            .do();

        const existingProject = existingProjectResult.data?.Get?.Project?.[0];

        if (!existingProject) {
            throw new Error("Project not found");
        }

        // Verify organization ownership
        if (existingProject.clerkOrgId !== orgId) {
            throw new Error("Unauthorized: Project does not belong to your organization");
        }

        const now = new Date().toISOString();

        // Update project in Weaviate - IMPORTANT: include all existing properties
        await client.data
            .updater()
            .withClassName("Project")
            .withId(projectId)
            .withProperties({
                name,
                description,
                address,
                city,
                state,
                country,
                zipCode,
                // Preserve these properties from the existing project
                clerkOrgId: existingProject.clerkOrgId || orgId, // Fallback to current orgId if missing
                createdAt: existingProject.createdAt || now,
                updatedAt: now
            })
            .do();
    } catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Failed to update project');
    }

    // These must be outside the try/catch block
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    redirect(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const client = getWeaviateClient();

    try {
        // Check if the project exists and belongs to the organization
        const checkResult = await client.graphql
            .get()
            .withClassName("Project")
            .withFields("clerkOrgId _additional { id }")
            .withWhere({
                operator: "Equal",
                path: ["_id"],
                valueString: projectId
            })
            .do();

        const project = checkResult.data?.Get?.Project?.[0];

        if (!project) {
            throw new Error("Project not found");
        }

        if (project.clerkOrgId !== orgId && project.clerkOrgId !== null) {
            throw new Error("Unauthorized: Project does not belong to your organization");
        }

        // Delete project from Weaviate
        await client.data
            .deleter()
            .withClassName("Project")
            .withId(projectId)
            .do();

        console.log(`Project ${projectId} deleted successfully`);
    } catch (error) {
        console.error('Error deleting project:', error);
        throw new Error('Failed to delete project');
    }

    // These must be outside the try/catch block
    revalidatePath('/projects');
    redirect('/projects');
}