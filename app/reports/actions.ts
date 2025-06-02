'use server';

import { revalidatePath } from 'next/cache';
import { getWeaviateClient } from "@/lib/weaviate/client";

export async function getReports() {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Report")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    reportDate
                    projectId
                    workerId
                    createdAt
                    updatedAt
                    project {
                        ... on Project {
                            name
                        }
                    }
                    worker {
                        ... on Worker {
                            firstName
                            lastName
                        }
                    }
                `)
                .withSort([{ path: ["reportDate"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Report || result.data.Get.Report.length === 0) {
                return [];
            }

            return result.data.Get.Report;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw new Error('Failed to fetch reports');
    }
}

export async function getReportById(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Report")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    reportDate
                    projectId
                    workerId
                    createdAt
                    updatedAt
                    project {
                        ... on Project {
                            name
                        }
                    }
                    worker {
                        ... on Worker {
                            firstName
                            lastName
                        }
                    }
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Report || result.data.Get.Report.length === 0) {
                return null;
            }

            return result.data.Get.Report[0];
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching report ${id}:`, error);
        throw new Error('Failed to fetch report');
    }
}

export async function getReportsByProjectId(projectId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Report")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    reportDate
                    projectId
                    workerId
                    createdAt
                    updatedAt
                    worker {
                        ... on Worker {
                            firstName
                            lastName
                        }
                    }
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["projectId"],
                    valueString: projectId
                })
                .withSort([{ path: ["reportDate"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Report || result.data.Get.Report.length === 0) {
                return [];
            }

            return result.data.Get.Report;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching reports for project ${projectId}:`, error);
        throw new Error('Failed to fetch reports');
    }
}

export async function getReportsByWorkerId(workerId: string) {
    try {
        const client = await getWeaviateClient();

        try {
            const result = await client.graphql
                .get()
                .withClassName("Report")
                .withFields(`
                    id
                    title
                    filePath
                    fileType
                    fileSize
                    reportDate
                    projectId
                    workerId
                    createdAt
                    updatedAt
                `)
                .withWhere({
                    operator: "Equal",
                    path: ["workerId"],
                    valueString: workerId
                })
                .withSort([{ path: ["reportDate"], order: "desc" }])
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Report || result.data.Get.Report.length === 0) {
                return [];
            }

            return result.data.Get.Report;
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error fetching reports for worker ${workerId}:`, error);
        throw new Error('Failed to fetch reports');
    }
}

export async function deleteReport(id: string) {
    try {
        const client = await getWeaviateClient();

        try {
            // Get the report to get the projectId and workerId before deleting
            const result = await client.graphql
                .get()
                .withClassName("Report")
                .withFields("projectId workerId filePath")
                .withWhere({
                    operator: "Equal",
                    path: ["id"],
                    valueString: id
                })
                .do();

            if (!result.data || !result.data.Get || !result.data.Get.Report || result.data.Get.Report.length === 0) {
                throw new Error('Report not found');
            }

            const report = result.data.Get.Report[0];

            // Delete the report record
            await client.data
                .deleter()
                .withClassName("Report")
                .withId(id)
                .do();

            // TODO: Delete the actual file if needed

            revalidatePath('/reports');
            revalidatePath(`/workers/${report.workerId}`);
            revalidatePath(`/projects/${report.projectId}`);
        } finally {
            await client.close();
        }
    } catch (error) {
        console.error(`Error deleting report ${id}:`, error);
        throw new Error('Failed to delete report');
    }
}