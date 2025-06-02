'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getWeaviateClient } from "@/lib/weaviate/client";

export async function getSubcontractors() {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Subcontractor")
                .withFields(`
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
                    workers {
                        ... on Worker {
                            id
                            firstName
                            lastName
                        }
                    }
                    projects {
                        ... on SubcontractorProject {
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
                .withSort([{ path: ["name"], order: "asc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Subcontractor) {
                return [];
            }

            return result.data.Get.Subcontractor;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching subcontractors:', error);
        throw new Error('Failed to fetch subcontractors');
    }
}

export async function getSubcontractorById(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Subcontractor")
                .withFields(`
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
                    workers {
                        ... on Worker {
                            id
                            firstName
                            lastName
                            email
                            phone
                        }
                    }
                    projects {
                        ... on SubcontractorProject {
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
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Subcontractor || result.data.Get.Subcontractor.length === 0) {
                return null;
            }

            return result.data.Get.Subcontractor[0];
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching subcontractor ${id}:`, error);
        throw new Error('Failed to fetch subcontractor');
    }
}

export async function getSubcontractorsByProjectId(projectId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            // First, get all SubcontractorProject entries for this project
            const junctionResult = await client.graphql
                .get()
                .withClassName("SubcontractorProject")
                .withFields(`
                    id
                    assignedAt
                    subcontractorId
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["projectId"],
                    valueString: projectId
                })
                .do();

            if (!junctionResult.data || !junctionResult.data.Get || !junctionResult.data.Get.SubcontractorProject || junctionResult.data.Get.SubcontractorProject.length === 0) {
                return [];
            }

            // Extract the subcontractor IDs
            const subcontractorIds = junctionResult.data.Get.SubcontractorProject.map(junction => junction.subcontractorId);

            // Now get the actual subcontractors
            const whereOperands = subcontractorIds.map(id => ({
                operator: "Equal",
                path: ["id"],
                valueString: id
            }));

            const result = await client.graphql
                .get()
                .withClassName("Subcontractor")
                .withFields(`
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
                    workers {
                        ... on Worker {
                            id
                        }
                    }
                `)
                .withWhere({
                    operator: "Or",
                    operands: whereOperands
                })
                .withSort([{ path: ["name"], order: "asc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Subcontractor) {
                return [];
            }

            // Format results to include worker count and assignment date
            return result.data.Get.Subcontractor.map(sub => {
                const junction = junctionResult.data.Get.SubcontractorProject.find(
                    j => j.subcontractorId === sub.id
                );

                return {
                    ...sub,
                    _count: {
                        workers: sub.workers ? sub.workers.length : 0
                    },
                    projects: [{
                        assignedAt: junction ? junction.assignedAt : null
                    }]
                };
            });
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching subcontractors for project ${projectId}:`, error);
        throw new Error('Failed to fetch subcontractors');
    }
}

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

        const client = await getWeaviateClient();

        try {
            const now = new Date().toISOString();

            // Create the subcontractor
            const result = await client.graphql
                .get()
                .withClassName("Subcontractor")
                .withFields("id")
                .withWhere({
                    operator: "Equal",
                    path: ["name"],
                    valueString: name.trim()
                })
                .do();

            let subcontractorId;

            // Check if subcontractor exists already
            if (result.data && result.data.Get && result.data.Get.Subcontractor && result.data.Get.Subcontractor.length > 0) {
                // Subcontractor exists, use its ID
                subcontractorId = result.data.Get.Subcontractor[0].id;
            } else {
                // Create a new subcontractor
                const createResult = await client.data
                    .creator()
                    .withClassName("Subcontractor")
                    .withProperties({
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
                        createdAt: now,
                        updatedAt: now
                    })
                    .do();

                subcontractorId = createResult.id;
            }

            // If there are projects, create the associations
            if (projectIds && projectIds.length > 0) {
                for (const projectId of projectIds) {
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
                    await client.graphql
                        .get()
                        .withClassName("SubcontractorProject")
                        .withFields("id")
                        .withWhere({
                            operator: "Equal",
                            path: ["id"],
                            valueString: junctionId
                        })
                        .do();

                    // Create reference from junction to subcontractor
                    await client.data.referenceCreator()
                        .withClassName("SubcontractorProject")
                        .withId(junctionId)
                        .withReferenceProperty("subcontractor")
                        .withReference({
                            beacon: `weaviate://localhost/Subcontractor/${subcontractorId}`
                        })
                        .do();

                    // Create reference from junction to project
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
                }
            }

            // Success - revalidate paths
            revalidatePath('/subcontractors');

            if (projectIds && projectIds.length > 0) {
                projectIds.forEach(projectId => {
                    revalidatePath(`/projects/${projectId}`);
                });
            }

            // Return the subcontractor ID
            return subcontractorId;
        } finally {
            await client.close();
        }
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

        const client = await getWeaviateClient();

        try {
            const now = new Date().toISOString();

            // Basic subcontractor data update
            await client.data
                .updater()
                .withClassName("Subcontractor")
                .withId(id)
                .withProperties({
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
                    updatedAt: now
                })
                .do();

            // Get existing junction objects
            const junctionResult = await client.graphql
                .get()
                .withClassName("SubcontractorProject")
                .withFields("id projectId")
                .withWhere({
                    operator: "Equal",
                    path: ["subcontractorId"],
                    valueString: id
                })
                .do();

            // Delete existing junction objects
            if (junctionResult.data && junctionResult.data.Get && junctionResult.data.Get.SubcontractorProject) {
                for (const junction of junctionResult.data.Get.SubcontractorProject) {
                    await client.data
                        .deleter()
                        .withClassName("SubcontractorProject")
                        .withId(junction.id)
                        .do();
                }
            }

            // Create new junction objects
            if (projectIds && projectIds.length > 0) {
                for (const projectId of projectIds) {
                    // Create junction object
                    const junctionResult = await client.data
                        .creator()
                        .withClassName("SubcontractorProject")
                        .withProperties({
                            subcontractorId: id,
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
                            beacon: `weaviate://localhost/Subcontractor/${id}`
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
                        .withId(id)
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
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error updating subcontractor ${id}:`, error);
        throw new Error('Failed to update subcontractor');
    }
}

export async function deleteSubcontractor(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            // Get subcontractor data before deletion
            const subcontractorResult = await client.graphql
                .get()
                .withClassName("Subcontractor")
                .withFields(`
                    id
                    workers {
                        ... on Worker {
                            id
                        }
                    }
                    projects {
                        ... on SubcontractorProject {
                            id
                            projectId
                        }
                    }
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!subcontractorResult.data || !subcontractorResult.data.Get || !subcontractorResult.data.Get.Subcontractor || subcontractorResult.data.Get.Subcontractor.length === 0) {
                throw new Error('Subcontractor not found');
            }

            const subcontractor = subcontractorResult.data.Get.Subcontractor[0];

            // 1. Delete worker data
            if (subcontractor.workers && subcontractor.workers.length > 0) {
                for (const worker of subcontractor.workers) {
                    // Delete worker identifications
                    const wiResult = await client.graphql
                        .get()
                        .withClassName("WorkerIdentification")
                        .withFields("id")
                        .withWhere({
                            operator: "Equal",
                            path: ["workerId"],
                            valueString: worker.id
                        })
                        .do();

                    if (wiResult.data && wiResult.data.Get && wiResult.data.Get.WorkerIdentification) {
                        for (const wi of wiResult.data.Get.WorkerIdentification) {
                            await client.data
                                .deleter()
                                .withClassName("WorkerIdentification")
                                .withId(wi.id)
                                .do();
                        }
                    }

                    // Delete worker projects
                    const wpResult = await client.graphql
                        .get()
                        .withClassName("WorkerProject")
                        .withFields("id")
                        .withWhere({
                            operator: "Equal",
                            path: ["workerId"],
                            valueString: worker.id
                        })
                        .do();

                    if (wpResult.data && wpResult.data.Get && wpResult.data.Get.WorkerProject) {
                        for (const wp of wpResult.data.Get.WorkerProject) {
                            await client.data
                                .deleter()
                                .withClassName("WorkerProject")
                                .withId(wp.id)
                                .do();
                        }
                    }

                    // Delete reports
                    const reportResult = await client.graphql
                        .get()
                        .withClassName("Report")
                        .withFields("id")
                        .withWhere({
                            operator: "Equal",
                            path: ["workerId"],
                            valueString: worker.id
                        })
                        .do();

                    if (reportResult.data && reportResult.data.Get && reportResult.data.Get.Report) {
                        for (const report of reportResult.data.Get.Report) {
                            await client.data
                                .deleter()
                                .withClassName("Report")
                                .withId(report.id)
                                .do();
                        }
                    }

                    // Delete worker
                    await client.data
                        .deleter()
                        .withClassName("Worker")
                        .withId(worker.id)
                        .do();
                }
            }

            // 2. Delete subcontractor projects
            if (subcontractor.projects && subcontractor.projects.length > 0) {
                for (const project of subcontractor.projects) {
                    await client.data
                        .deleter()
                        .withClassName("SubcontractorProject")
                        .withId(project.id)
                        .do();
                }
            }

            // 3. Delete the subcontractor
            await client.data
                .deleter()
                .withClassName("Subcontractor")
                .withId(id)
                .do();

            // Revalidate paths
            revalidatePath('/subcontractors');
            if (subcontractor.projects && subcontractor.projects.length > 0) {
                const projectIds = subcontractor.projects.map(p => p.projectId);
                projectIds.forEach(projectId => {
                    revalidatePath(`/projects/${projectId}`);
                });
            }
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error deleting subcontractor ${id}:`, error);
        throw new Error('Failed to delete subcontractor');
    }
}

export async function createSubcontractorWithRedirect(formData: FormData) {
    // Create the subcontractor first
    const subcontractorId = await createSubcontractor(formData);

    // The redirect must be the last statement with no catch blocks
    redirect('/subcontractors');
}