// ./app/blueprints/[blueprintId]/edit/page.tsx

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlueprintById, updateBlueprint } from '../../actions';
import { getProjects } from '@/app/projects/actions';

interface EditBlueprintPageProps {
    params: {
        blueprintId: string;
    };
}

export default async function EditBlueprintPage({ params }: EditBlueprintPageProps) {
    const { blueprintId } = params;
    const blueprint = await getBlueprintById(blueprintId);

    if (!blueprint) {
        notFound();
    }

    const projects = await getProjects();

    async function handleUpdateBlueprint(formData: FormData) {
        'use server';

        await updateBlueprint(blueprintId, formData);
        redirect(`/blueprints/${blueprintId}`);
    }

    return (
        <div className="container mx-auto py-6">
            <Link href={`/blueprints/${blueprintId}`} className="text-blue-600 hover:underline mb-6 block">
                ← Back to Blueprint
            </Link>

            <h1 className="text-3xl font-bold mb-6">Edit Blueprint</h1>

            <form action={handleUpdateBlueprint} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Blueprint Title*
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            defaultValue={blueprint.title}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                            Project*
                        </label>
                        <select
                            id="projectId"
                            name="projectId"
                            required
                            defaultValue={blueprint.projectId}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Select a project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Current Blueprint
                        </label>
                        <a
                            href={blueprint.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 text-blue-600 hover:underline"
                        >
                            View Current Blueprint
                        </a>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            Replace Blueprint File (Optional)
                        </label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            className="mt-1 block w-full text-gray-700"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Upload a new blueprint file if you want to replace the current one.
                            Leave this empty to keep the current file.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Link
                        href={`/blueprints/${blueprintId}`}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Update Blueprint
                    </button>
                </div>
            </form>
        </div>
    );
}