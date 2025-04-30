import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from "@clerk/nextjs/server";
import { getProjects } from '@/app/projects/actions';
import { createWorkerWithRedirect } from '../actions';
import { getSubcontractors } from '@/app/subcontractors/actions';

export default async function NewWorkerPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const { userId, orgId } = await auth();
    const subcontractorId = typeof searchParams.subcontractorId === 'string' ? searchParams.subcontractorId : undefined;

    // Fetch the data directly in the component - App Router pattern
    const projects = await getProjects();
    const subcontractors = await getSubcontractors();

    if (!userId || !orgId) {
        redirect("/sign-in");
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/workers" className="text-[#DA7756] hover:opacity-80">
                    Workers
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">New Worker</span>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-[#DA7756]">Add New Worker</h1>

                    <form action={createWorkerWithRedirect}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-[#333333] mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    className="input-neumorphic w-full"
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-[#333333] mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    className="input-neumorphic w-full"
                                    placeholder="Enter last name"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="input-neumorphic w-full"
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-[#333333] mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="input-neumorphic w-full"
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label htmlFor="subcontractorId" className="block text-sm font-medium text-[#333333] mb-2">
                                    Subcontractor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="subcontractorId"
                                    name="subcontractorId"
                                    required
                                    className="input-neumorphic w-full"
                                    defaultValue={subcontractorId || ''}
                                >
                                    <option value="">Select a subcontractor</option>
                                    {subcontractors.map((subcontractor) => (
                                        <option key={subcontractor.id} value={subcontractor.id}>
                                            {subcontractor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="projects" className="block text-sm font-medium text-[#333333] mb-2">
                                    Projects
                                </label>
                                <p className="text-sm text-gray-500 mb-2">
                                    If you select projects that the subcontractor is not assigned to, the subcontractor will be automatically assigned to those projects.
                                </p>
                                <div className="card-neumorphic p-4 max-h-48 overflow-y-auto">
                                    <div className="space-y-2">
                                        {projects.map((project) => (
                                            <label key={project.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    name="projectIds"
                                                    value={project.id}
                                                    className="form-checkbox text-[#DA7756] rounded border-gray-300 focus:ring-[#DA7756]"
                                                />
                                                <span className="text-[#333333]">{project.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Link
                                href="/workers"
                                className="btn-neumorphic"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-neumorphic btn-primary"
                            >
                                Create Worker
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}