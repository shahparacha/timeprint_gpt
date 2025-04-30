'use server';

import { revalidatePath } from 'next/cache';
import { db } from "@/lib/db";

export async function getReports() {
    try {
        const reports = await db.report.findMany({
            orderBy: {
                reportDate: 'desc',
            },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                worker: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return reports;
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw new Error('Failed to fetch reports');
    }
}

export async function getReportById(id: string) {
    try {
        const report = await db.report.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        name: true,
                    },
                },
                worker: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return report;
    } catch (error) {
        console.error(`Error fetching report ${id}:`, error);
        throw new Error('Failed to fetch report');
    }
}

export async function getReportsByProjectId(projectId: string) {
    try {
        const reports = await db.report.findMany({
            where: {
                projectId,
            },
            orderBy: {
                reportDate: 'desc',
            },
            include: {
                worker: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return reports;
    } catch (error) {
        console.error(`Error fetching reports for project ${projectId}:`, error);
        throw new Error('Failed to fetch reports');
    }
}

export async function getReportsByWorkerId(workerId: string) {
    try {
        const reports = await db.report.findMany({
            where: {
                workerId,
            },
            orderBy: {
                reportDate: 'desc',
            },
        });

        return reports;
    } catch (error) {
        console.error(`Error fetching reports for worker ${workerId}:`, error);
        throw new Error('Failed to fetch reports');
    }
}

export async function deleteReport(id: string) {
    try {
        // Get the report to get the projectId and workerId before deleting
        const report = await db.report.findUnique({
            where: { id },
            select: {
                projectId: true,
                workerId: true,
                filePath: true,
            },
        });

        if (!report) {
            throw new Error('Report not found');
        }

        // Delete the report record
        await db.report.delete({
            where: { id },
        });

        // TODO: Delete the actual file if needed

        revalidatePath('/reports');
        revalidatePath(`/workers/${report.workerId}`);
        revalidatePath(`/projects/${report.projectId}`);
    } catch (error) {
        console.error(`Error deleting report ${id}:`, error);
        throw new Error('Failed to delete report');
    }
}