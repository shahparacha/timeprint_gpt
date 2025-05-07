'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from "@/lib/db";

export async function getSubcontractors() {
    try {
        const subcontractors = await db.subcontractor.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                workers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                projects: {
                    select: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        assignedAt: true,
                    },
                },
            },
        });

        return subcontractors;
    } catch (error) {
        console.error('Error fetching subcontractors:', error);
        throw new Error('Failed to fetch subcontractors');
    }
}

export async function getSubcontractorById(id: string) {
    try {
        const subcontractor = await db.subcontractor.findUnique({
            where: { id },
            include: {
                workers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                    orderBy: {
                        lastName: 'asc',
                    },
                },
                projects: {
                    select: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        assignedAt: true,
                    },
                },
            },
        });

        return subcontractor;
    } catch (error) {
        console.error(`Error fetching subcontractor ${id}:`, error);
        throw new Error('Failed to fetch subcontractor');
    }
}

export async function getSubcontractorsByProjectId(projectId: string) {
    try {
        const subcontractors = await db.subcontractor.findMany({
            where: {
                projects: {
                    some: {
                        projectId,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: {
                        workers: true,
                    },
                },
                projects: {
                    where: {
                        projectId,
                    },
                    select: {
                        assignedAt: true,
                    },
                },
            },
        });

        return subcontractors;
    } catch (error) {
        console.error(`Error fetching subcontractors for project ${projectId}:`, error);
        throw new Error('Failed to fetch subcontractors');
    }
}

// Base function without redirect
export async function createSubcontractor(formData: FormData) {
    try {
        // Extract basic data
        const name = formData.get('name') as string;

        // Validate name
        if (!name || name.trim() === '') {
            throw new Error('Company name is required');
        }

        // Get other fields with proper null handling
        const contactName = formData.get('contactName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const unitNumber = formData.get('unitNumber') as string;
        const city = formData.get('city') as string;
        const state = formData.get('state') as string;
        const country = formData.get('country') as string;
        const zipCode = formData.get('zipCode') as string;
        const taxId = formData.get('taxId') as string;

        // Get project IDs (optional)
        const projectIds = formData.getAll('projectIds') as string[];

        // Create the subcontractor
        const subcontractor = await db.subcontractor.create({
            data: {
                name: name.trim(),
                contactName: contactName ? contactName.trim() : null,
                email: email ? email.trim() : null,
                phone: phone ? phone.trim() : null,
                address: address ? address.trim() : null,
                unitNumber: unitNumber ? unitNumber.trim() : null,
                city: city ? city.trim() : null,
                state: state ? state.trim() : null,
                country: country ? country.trim() : null,
                zipCode: zipCode ? zipCode.trim() : null,
                taxId: taxId ? taxId.trim() : null,
            },
        });

        // If there are projects, add them in a separate step
        if (projectIds && projectIds.length > 0) {
            await Promise.all(
                projectIds.map(projectId =>
                    db.subcontractorProject.create({
                        data: {
                            subcontractorId: subcontractor.id,
                            projectId,
                        },
                    })
                )
            );
        }

        // Success - revalidate paths
        revalidatePath('/subcontractors');

        if (projectIds && projectIds.length > 0) {
            projectIds.forEach(projectId => {
                revalidatePath(`/projects/${projectId}`);
            });
        }

        // Return the subcontractor ID
        return subcontractor.id;

    } catch (error) {
        console.error('Error creating subcontractor:', error);
        throw error; // Re-throw the original error
    }
}

export async function createSubcontractorAndRedirect(formData: FormData) {
    try {
        await createSubcontractor(formData);
        // Redirect to the subcontractors listing page
        redirect('/subcontractors');
    } catch (error) {
        console.error("Error in subcontractor creation:", error);
        throw error;
    }
}

export async function updateSubcontractor(id: string, formData: FormData) {
    try {
        // Extract and validate required fields
        const name = formData.get('name') as string;
        if (!name) {
            throw new Error('Name is required');
        }

        // Get project IDs as an array (optional)
        const projectIds = formData.getAll('projectIds') as string[];

        // Basic subcontractor data update
        await db.subcontractor.update({
            where: { id },
            data: {
                name,
                contactName: (formData.get('contactName') as string) || null,
                email: (formData.get('email') as string) || null,
                phone: (formData.get('phone') as string) || null,
                address: (formData.get('address') as string) || null,
                unitNumber: (formData.get('unitNumber') as string) || null,
                city: (formData.get('city') as string) || null,
                state: (formData.get('state') as string) || null,
                country: (formData.get('country') as string) || null,
                zipCode: (formData.get('zipCode') as string) || null,
                taxId: (formData.get('taxId') as string) || null,
            }
        });

        // Handle project associations separately 
        // First delete existing associations
        await db.subcontractorProject.deleteMany({
            where: { subcontractorId: id }
        });

        // Then create new associations for each selected project
        if (projectIds && projectIds.length > 0) {
            for (const projectId of projectIds) {
                await db.subcontractorProject.create({
                    data: {
                        subcontractorId: id,
                        projectId
                    }
                });
            }
        }

        // Revalidate paths
        revalidatePath(`/subcontractors/${id}`);
        revalidatePath('/subcontractors');

        // Revalidate project paths
        if (projectIds && projectIds.length > 0) {
            for (const projectId of projectIds) {
                revalidatePath(`/projects/${projectId}`);
            }
        }

        // Return success
        return { success: true };
    } catch (error) {
        console.error(`Error updating subcontractor ${id}:`, error);
        throw new Error('Failed to update subcontractor');
    }
}

export async function deleteSubcontractor(id: string) {
    try {
        // Get subcontractor data before deletion
        const subcontractor = await db.subcontractor.findUnique({
            where: { id },
            include: {
                workers: {
                    select: {
                        id: true,
                    },
                },
                projects: true,
            },
        });

        if (!subcontractor) {
            throw new Error('Subcontractor not found');
        }

        // Start a transaction to handle cascading deletes properly
        await db.$transaction(async (tx) => {
            if (subcontractor.workers.length > 0) {
                // Get all worker IDs
                const workerIds = subcontractor.workers.map(worker => worker.id);

                // Delete worker identifications
                await tx.workerIdentification.deleteMany({
                    where: {
                        workerId: {
                            in: workerIds,
                        },
                    },
                });

                // Delete worker-project associations
                await tx.workerProject.deleteMany({
                    where: {
                        workerId: {
                            in: workerIds,
                        },
                    },
                });

                // Delete reports
                await tx.report.deleteMany({
                    where: {
                        workerId: {
                            in: workerIds,
                        },
                    },
                });

                // Delete workers
                await tx.worker.deleteMany({
                    where: {
                        subcontractorId: id,
                    },
                });
            }

            // Delete subcontractor-project associations
            await tx.subcontractorProject.deleteMany({
                where: {
                    subcontractorId: id,
                },
            });

            // Delete the subcontractor
            await tx.subcontractor.delete({
                where: { id },
            });
        });

        // Revalidate paths
        revalidatePath('/subcontractors');
        subcontractor.projects.forEach(({ projectId }) => {
            revalidatePath(`/projects/${projectId}`);
        });
    } catch (error) {
        console.error(`Error deleting subcontractor ${id}:`, error);
        throw new Error('Failed to delete subcontractor');
    }
}

// Add this new function at the end
export async function createSubcontractorWithRedirect(formData: FormData) {
    // Extract basic data
    const name = formData.get('name') as string;

    // Validate name
    if (!name || name.trim() === '') {
        throw new Error('Company name is required');
    }

    // Get other fields with proper null handling
    const contactName = formData.get('contactName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const unitNumber = formData.get('unitNumber') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const zipCode = formData.get('zipCode') as string;
    const taxId = formData.get('taxId') as string;

    // Get project IDs (optional)
    const projectIds = formData.getAll('projectIds') as string[];

    // Create the subcontractor
    const subcontractor = await db.subcontractor.create({
        data: {
            name: name.trim(),
            contactName: contactName ? contactName.trim() : null,
            email: email ? email.trim() : null,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null,
            unitNumber: unitNumber ? unitNumber.trim() : null,
            city: city ? city.trim() : null,
            state: state ? state.trim() : null,
            country: country ? country.trim() : null,
            zipCode: zipCode ? zipCode.trim() : null,
            taxId: taxId ? taxId.trim() : null,
        },
    });

    // If there are projects, add them in a separate step
    if (projectIds && projectIds.length > 0) {
        for (const projectId of projectIds) {
            await db.subcontractorProject.create({
                data: {
                    subcontractorId: subcontractor.id,
                    projectId: projectId,
                },
            });
        }
    }

    // Revalidate paths
    revalidatePath('/subcontractors');

    if (projectIds && projectIds.length > 0) {
        projectIds.forEach(projectId => {
            revalidatePath(`/projects/${projectId}`);
        });
    }

    // The redirect must be the last statement with no catch blocks
    redirect('/subcontractors');
}