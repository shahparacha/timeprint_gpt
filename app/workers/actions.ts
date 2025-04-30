'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

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

        // Create the worker record
        const worker = await db.worker.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                subcontractorId,
            },
        });

        // If projects were selected, create the worker-project connections
        if (projectIds.length > 0) {
            // Create all worker-project connections
            await Promise.all(
                projectIds.map((projectId) =>
                    db.workerProject.create({
                        data: {
                            workerId: worker.id,
                            projectId,
                        },
                    })
                )
            );
        }

        // Refresh worker list 
        revalidatePath('/workers');

        // Return the worker ID
        return worker.id;

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
        const workers = await db.worker.findMany({
            where: {
                subcontractorId,
            },
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' },
            ],
            include: {
                projects: {
                    include: {
                        project: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return workers;
    } catch (error) {
        console.error(`Error fetching workers for subcontractor ${subcontractorId}:`, error);
        throw error;
    }
}

// Other worker-related functions...
export async function getWorkers() {
    try {
        const workers = await db.worker.findMany({
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' },
            ],
            include: {
                projects: {
                    include: {
                        project: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                subcontractor: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return workers;
    } catch (error) {
        console.error('Error fetching workers:', error);
        throw error;
    }
}

export async function getWorkerById(id: string) {
    try {
        const worker = await db.worker.findUnique({
            where: { id },
            include: {
                projects: {
                    include: {
                        project: true,
                    },
                },
                subcontractor: true,
                identifications: true,
            },
        });

        return worker;
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

    // Update the worker record
    await db.worker.update({
        where: { id },
        data: {
            firstName,
            lastName,
            email,
            phone,
            subcontractorId,
        },
    });

    // Delete all existing worker-project connections for this worker
    await db.workerProject.deleteMany({
        where: {
            workerId: id,
        },
    });

    // If projects were selected
    if (projectIds.length > 0) {
        // First, get the subcontractor's current projects
        const subcontractor = await db.subcontractor.findUnique({
            where: { id: subcontractorId },
            include: {
                projects: {
                    select: { projectId: true }
                }
            }
        });

        // Get list of current project IDs for the subcontractor
        const existingProjectIds = subcontractor?.projects.map(p => p.projectId) || [];

        // Find projects that need to be added to the subcontractor
        const projectsToAdd = projectIds.filter(id => !existingProjectIds.includes(id));

        // Add new projects to the subcontractor if needed
        for (const projectId of projectsToAdd) {
            await db.subcontractorProject.create({
                data: {
                    subcontractorId,
                    projectId,
                }
            });
        }

        // Create worker-project connections
        for (const projectId of projectIds) {
            await db.workerProject.create({
                data: {
                    workerId: id,
                    projectId,
                },
            });
        }

        // Revalidate project paths for newly added projects
        projectsToAdd.forEach(projectId => {
            revalidatePath(`/projects/${projectId}`);
        });
    }

    // Revalidate paths
    revalidatePath(`/workers/${id}`);
    revalidatePath('/workers');
    revalidatePath('/subcontractors');
    revalidatePath(`/subcontractors/${subcontractorId}`);

    redirect('/workers');
}

export async function deleteWorker(id: string) {
    try {
        // Delete the worker (related records will be deleted due to cascade)
        await db.worker.delete({
            where: { id },
        });

        revalidatePath('/workers');
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

    // Create the worker record
    const worker = await db.worker.create({
        data: {
            firstName,
            lastName,
            email,
            phone,
            subcontractorId,
        },
    });

    // If projects were selected
    if (projectIds.length > 0) {
        // First, get the subcontractor's current projects
        const subcontractor = await db.subcontractor.findUnique({
            where: { id: subcontractorId },
            include: {
                projects: {
                    select: { projectId: true }
                }
            }
        });

        // Get list of current project IDs for the subcontractor
        const existingProjectIds = subcontractor?.projects.map(p => p.projectId) || [];

        // Find projects that need to be added to the subcontractor
        const projectsToAdd = projectIds.filter(id => !existingProjectIds.includes(id));

        // Add new projects to the subcontractor if needed
        for (const projectId of projectsToAdd) {
            await db.subcontractorProject.create({
                data: {
                    subcontractorId,
                    projectId,
                }
            });
        }

        // Create worker-project connections
        for (const projectId of projectIds) {
            await db.workerProject.create({
                data: {
                    workerId: worker.id,
                    projectId,
                },
            });
        }

        // Revalidate project paths for newly added projects
        projectsToAdd.forEach(projectId => {
            revalidatePath(`/projects/${projectId}`);
        });
    }

    // Refresh worker and subcontractor lists
    revalidatePath('/workers');
    revalidatePath('/subcontractors');
    revalidatePath(`/subcontractors/${subcontractorId}`);

    // The redirect must be the last statement with no try/catch blocks
    redirect('/workers');
}