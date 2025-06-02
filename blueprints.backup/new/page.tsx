import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProjects } from '@/app/projects/actions';
import { createBlueprint } from '../actions';

export default async function NewBlueprintPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const projectId = typeof searchParams.projectId === 'string' ? searchParams.projectId : undefined;
    const projects = await getProjects();

    async function handleCreateBlueprint(formData: FormData) {
        'use server';
        const blueprintId = await createBlueprint(formData);
        redirect(`/blueprints/${blueprintId}`);
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/blueprints" className="text-[#DA7756] hover:opacity-80">
                    Blueprints
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">New Blueprint</span>
            </div>

            {/* Main Form Card */}
            <div className="card-neumorphic">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-[#DA7756]">Add New Blueprint</h1>

                    <form action={handleCreateBlueprint}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-[#333333] mb-2">
                                    Blueprint Title*
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    placeholder="E.g. Floor Plan, Elevation, Electrical Plan"
                                    className="input-neumorphic w-full"
                                />
                            </div>

                            <div>
                                <label htmlFor="projectId" className="block text-sm font-medium text-[#333333] mb-2">
                                    Project*
                                </label>
                                <select
                                    id="projectId"
                                    name="projectId"
                                    required
                                    defaultValue={projectId || ''}
                                    className="input-neumorphic w-full"
                                >
                                    <option value="">Select a project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="file" className="block text-sm font-medium text-[#333333] mb-2">
                                    Blueprint File*
                                </label>
                                <input
                                    type="file"
                                    id="file"
                                    name="file"
                                    required
                                    className="block w-full text-[#333333] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#DA7756] file:text-white hover:file:opacity-90"
                                />
                                <p className="mt-2 text-sm text-[#666666]">
                                    Upload a blueprint file. Supported formats: PDF, DWG, DXF, JPG, PNG.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Link
                                href="/blueprints"
                                className="btn-neumorphic"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-neumorphic btn-primary"
                            >
                                Upload Blueprint
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}