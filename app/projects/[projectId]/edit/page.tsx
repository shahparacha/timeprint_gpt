import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { updateProject } from "../../actions";

export default async function EditProjectPage({
    params
}: {
    params: { projectId: string }
}) {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        redirect("/sign-in");
    }

    // Fix: Await params before using its properties
    const resolvedParams = await params;
    const projectId = resolvedParams.projectId;

    const project = await db.project.findUnique({
        where: {
            id: projectId,
            clerkOrgId: orgId // Ensure the project belongs to the user's organization
        }
    });

    if (!project) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Link href="/projects" className="text-[#DA7756] hover:opacity-80">
                    Projects
                </Link>
                <span className="text-[#333333]">/</span>
                <Link href={`/projects/${project.id}`} className="text-[#DA7756] hover:opacity-80">
                    {project.name}
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">Edit</span>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-[#DA7756]">Edit Project</h1>

                    <form action={async (formData: FormData) => {
                        "use server";
                        await updateProject(project.id, formData);
                    }} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-[#333333] mb-1"
                                >
                                    Project Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    defaultValue={project.name}
                                    className="input-neumorphic w-full"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-[#333333] mb-1"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={project.description || ""}
                                    className="input-neumorphic w-full"
                                    placeholder="Enter project description"
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-3 text-[#DA7756]">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="address"
                                            className="block text-sm font-medium text-[#333333] mb-1"
                                        >
                                            Address
                                        </label>
                                        <input
                                            id="address"
                                            name="address"
                                            type="text"
                                            defaultValue={project.address || ""}
                                            className="input-neumorphic w-full"
                                            placeholder="Street address"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="city"
                                            className="block text-sm font-medium text-[#333333] mb-1"
                                        >
                                            City
                                        </label>
                                        <input
                                            id="city"
                                            name="city"
                                            type="text"
                                            defaultValue={project.city || ""}
                                            className="input-neumorphic w-full"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="state"
                                            className="block text-sm font-medium text-[#333333] mb-1"
                                        >
                                            State
                                        </label>
                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            defaultValue={project.state || ""}
                                            className="input-neumorphic w-full"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="country"
                                            className="block text-sm font-medium text-[#333333] mb-1"
                                        >
                                            Country
                                        </label>
                                        <input
                                            id="country"
                                            name="country"
                                            type="text"
                                            defaultValue={project.country || ""}
                                            className="input-neumorphic w-full"
                                            placeholder="Country"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="zipCode"
                                            className="block text-sm font-medium text-[#333333] mb-1"
                                        >
                                            Zip Code
                                        </label>
                                        <input
                                            id="zipCode"
                                            name="zipCode"
                                            type="text"
                                            defaultValue={project.zipCode || ""}
                                            className="input-neumorphic w-full"
                                            placeholder="Zip code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="btn-neumorphic btn-primary"
                            >
                                Update Project
                            </button>

                            <Link
                                href={`/projects/${project.id}`}
                                className="btn-neumorphic"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}