'use server'

import { auth } from '@clerk/nextjs/server';
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects() {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const projects = await db.project.findMany({
        where: {
            clerkOrgId: orgId
        },
        orderBy: {
            name: 'asc'
        }
    });

    return projects;
}

export async function createProject(formData: FormData) {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const zipCode = formData.get('zipCode') as string;

    if (!name) {
        throw new Error("Name is required");
    }

    const project = await db.project.create({
        data: {
            name,
            description,
            address,
            city,
            state,
            country,
            zipCode,
            clerkOrgId: orgId
        }
    });

    revalidatePath('/projects');
    redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, formData: FormData) {
    // Get the authenticated user and their organization
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const zipCode = formData.get('zipCode') as string;

    if (!name) {
        throw new Error("Name is required");
    }

    // Check if the project exists and belongs to the organization
    const existingProject = await db.project.findUnique({
        where: {
            id: projectId,
            clerkOrgId: orgId
        }
    });

    if (!existingProject) {
        throw new Error("Project not found");
    }

    await db.project.update({
        where: {
            id: projectId
        },
        data: {
            name,
            description,
            address,
            city,
            state,
            country,
            zipCode
        }
    });

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

    // Check if the project exists and belongs to the organization
    const existingProject = await db.project.findUnique({
        where: {
            id: projectId,
            clerkOrgId: orgId
        }
    });

    if (!existingProject) {
        throw new Error("Project not found");
    }

    await db.project.delete({
        where: {
            id: projectId
        }
    });

    revalidatePath('/projects');
    redirect('/projects');
}