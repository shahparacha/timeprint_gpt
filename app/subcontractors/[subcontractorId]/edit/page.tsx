import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSubcontractorById, updateSubcontractor } from '../../actions';
import { getProjects } from '@/app/projects/actions';

interface EditSubcontractorPageProps {
    params: {
        subcontractorId: string;
    };
}

export default async function EditSubcontractorPage({ params }: EditSubcontractorPageProps) {
    const { subcontractorId } = params;
    const subcontractor = await getSubcontractorById(subcontractorId);
    const projects = await getProjects();

    if (!subcontractor) {
        notFound();
    }

    async function handleUpdateSubcontractor(formData: FormData) {
        'use server';

        await updateSubcontractor(subcontractorId, formData);
        redirect(`/subcontractors/${subcontractorId}`);
    }

    return (
        <div className="container mx-auto py-6">
            <Link href={`/subcontractors/${subcontractorId}`} className="text-blue-600 hover:underline mb-6 block">
                ← Back to Subcontractor
            </Link>

            <h1 className="text-3xl font-bold mb-6">Edit Subcontractor</h1>

            <form action={handleUpdateSubcontractor} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Company Name*
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            defaultValue={subcontractor.name}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                            Contact Name
                        </label>
                        <input
                            type="text"
                            id="contactName"
                            name="contactName"
                            defaultValue={subcontractor.contactName || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={subcontractor.email || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            defaultValue={subcontractor.phone || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            defaultValue={subcontractor.address || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="unitNumber" className="block text-sm font-medium text-gray-700">
                            Unit/Suite Number
                        </label>
                        <input
                            type="text"
                            id="unitNumber"
                            name="unitNumber"
                            defaultValue={subcontractor.unitNumber || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            defaultValue={subcontractor.city || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                            State/Province
                        </label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            defaultValue={subcontractor.state || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                            Country
                        </label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            defaultValue={subcontractor.country || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            Zip/Postal Code
                        </label>
                        <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            defaultValue={subcontractor.zipCode || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                            Tax ID
                        </label>
                        <input
                            type="text"
                            id="taxId"
                            name="taxId"
                            defaultValue={subcontractor.taxId || ''}
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
                            defaultValue={subcontractor.projectId}
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
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Link
                        href={`/subcontractors/${subcontractorId}`}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Update Subcontractor
                    </button>
                </div>
            </form>
        </div>
    );
}
