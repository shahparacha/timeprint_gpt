import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { DeleteProjectButton } from "@/app/components/delete-project-button";

interface ProjectDetailPageProps {
    params: {
        projectId: string;
    };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { projectId } = params;

    // Get auth info
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        return <div className="p-6">Please sign in to view this project</div>;
    }

    try {
        const project = await db.project.findUnique({
            where: {
                id: projectId,
                clerkOrgId: orgId,
            },
            include: {
                workers: {
                    include: {
                        worker: true,
                    },
                },
                blueprints: {
                    take: 3,
                    orderBy: {
                        createdAt: "desc"
                    }
                },
                reports: {
                    take: 3,
                    orderBy: {
                        reportDate: "desc"
                    },
                    include: {
                        worker: true
                    }
                }
            }
        });

        if (!project) {
            return notFound();
        }

        return (
            <div className="flex flex-col min-h-[calc(100vh-80px)]">
                <div className="flex-1 py-6 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-6 text-sm">
                            <Link href="/projects" className="text-[#DA7756] hover:opacity-80 transition-opacity">
                                Projects
                            </Link>
                            <span className="text-[#333333]">/</span>
                            <span className="text-[#333333] font-medium">{project.name}</span>
                        </div>

                        {/* Header Section */}
                        <div className="card-neumorphic mb-6">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">{project.name}</h1>
                                        {project.description && (
                                            <p className="text-[#333333] mb-4 max-w-3xl">{project.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/projects/${project.id}/edit`}
                                            className="btn-neumorphic"
                                        >
                                            Edit Project
                                        </Link>
                                        <DeleteProjectButton id={project.id} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Project Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            {/* Location Details */}
                            <div className="card-neumorphic p-6">
                                <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Location Details</h3>
                                <div className="space-y-3">
                                    {project.address && (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#333333] font-medium">Address</span>
                                            <span className="text-[#333333]">{project.address}</span>
                                        </div>
                                    )}
                                    {project.city && (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#333333] font-medium">City</span>
                                            <span className="text-[#333333]">{project.city}</span>
                                        </div>
                                    )}
                                    {project.state && (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#333333] font-medium">State</span>
                                            <span className="text-[#333333]">{project.state}</span>
                                        </div>
                                    )}
                                    {project.country && (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#333333] font-medium">Country</span>
                                            <span className="text-[#333333]">{project.country}</span>
                                        </div>
                                    )}
                                    {project.zipCode && (
                                        <div className="flex flex-col">
                                            <span className="text-sm text-[#333333] font-medium">Zip Code</span>
                                            <span className="text-[#333333]">{project.zipCode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Project Stats */}
                            <div className="card-neumorphic p-6">
                                <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Project Stats</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="card-neumorphic p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#333333]">Workers</span>
                                            <span className="text-xl font-semibold text-[#DA7756]">
                                                {project.workers.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-neumorphic p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#333333]">Reports</span>
                                            <span className="text-xl font-semibold text-[#DA7756]">
                                                {project.reports.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-neumorphic p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#333333]">Blueprints</span>
                                            <span className="text-xl font-semibold text-[#DA7756]">
                                                {project.blueprints.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="card-neumorphic p-6">
                                <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        href={`/projects/${project.id}/reports/new`}
                                        className="btn-neumorphic w-full justify-center"
                                    >
                                        Create Report
                                    </Link>
                                    <Link
                                        href={`/projects/${project.id}/blueprints/new`}
                                        className="btn-neumorphic w-full justify-center"
                                    >
                                        Upload Blueprint
                                    </Link>
                                    <Link
                                        href={`/projects/${project.id}/workers/new`}
                                        className="btn-neumorphic w-full justify-center"
                                    >
                                        Add Worker
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Reports */}
                            <div className="card-neumorphic p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-[#DA7756]">Recent Reports</h3>
                                    <Link
                                        href={`/projects/${project.id}/reports`}
                                        className="text-sm text-[#DA7756] hover:opacity-80 transition-opacity"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {project.reports.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[#333333]">No reports available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {project.reports.map((report) => (
                                            <Link
                                                key={report.id}
                                                href={`/reports/${report.id}`}
                                                className="card-neumorphic block p-4 hover:shadow-lg transition-all"
                                            >
                                                <h4 className="font-medium mb-2 text-[#DA7756]">{report.title || "Untitled Report"}</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#333333]">
                                                        By: {report.worker.firstName} {report.worker.lastName}
                                                    </span>
                                                    <span className="text-[#333333]">
                                                        {new Date(report.reportDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent Blueprints */}
                            <div className="card-neumorphic p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-[#DA7756]">Recent Blueprints</h3>
                                    <Link
                                        href={`/blueprints?projectId=${project.id}`}
                                        className="text-sm text-[#DA7756] hover:opacity-80 transition-opacity"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {project.blueprints.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-[#333333]">No blueprints available</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {project.blueprints.map((blueprint) => (
                                            <Link
                                                key={blueprint.id}
                                                href={`/blueprints/${blueprint.id}`}
                                                className="card-neumorphic block p-4 hover:shadow-lg transition-all"
                                            >
                                                <h4 className="font-medium mb-2 text-[#DA7756]">{blueprint.title}</h4>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#333333]">
                                                        {blueprint.fileType.toUpperCase()}
                                                    </span>
                                                    <span className="text-[#333333]">
                                                        {new Date(blueprint.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error fetching project:", error);
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-red-600">Error loading project</h2>
                <p className="mt-2">Please try again later or contact support</p>
            </div>
        );
    }
}