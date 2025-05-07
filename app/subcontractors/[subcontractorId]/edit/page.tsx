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
    const { subcontractorId } = await params;
    const subcontractor = await getSubcontractorById(subcontractorId);
    const projects = await getProjects();

    if (!subcontractor) {
        notFound();
    }

    // Get the currently associated project IDs
    const currentProjectIds = subcontractor.projects.map(p => p.project.id);

    async function handleUpdateSubcontractor(formData: FormData) {
        'use server';

        const result = await updateSubcontractor(subcontractorId, formData);
        if (result.success) {
            redirect(`/subcontractors/${subcontractorId}`);
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/subcontractors" className="text-[#DA7756] hover:opacity-80">
                    Subcontractors
                </Link>
                <span className="text-[#333333]">/</span>
                <Link href={`/subcontractors/${subcontractorId}`} className="text-[#DA7756] hover:opacity-80">
                    Details
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">Edit</span>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-[#DA7756]">Edit Subcontractor</h1>
                    <form action={handleUpdateSubcontractor}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Company Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={subcontractor.name}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="contactName" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    id="contactName"
                                    name="contactName"
                                    defaultValue={subcontractor.contactName || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    defaultValue={subcontractor.email || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    defaultValue={subcontractor.phone || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    defaultValue={subcontractor.address || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="unitNumber" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Unit/Suite Number
                                </label>
                                <input
                                    type="text"
                                    id="unitNumber"
                                    name="unitNumber"
                                    defaultValue={subcontractor.unitNumber || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block mb-2 text-sm font-medium text-[#333333]">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    defaultValue={subcontractor.city || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="state" className="block mb-2 text-sm font-medium text-[#333333]">
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    defaultValue={subcontractor.state || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    defaultValue={subcontractor.country || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="zipCode" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Zip/Postal Code
                                </label>
                                <input
                                    type="text"
                                    id="zipCode"
                                    name="zipCode"
                                    defaultValue={subcontractor.zipCode || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="taxId" className="block mb-2 text-sm font-medium text-[#333333]">
                                    Tax ID
                                </label>
                                <input
                                    type="text"
                                    id="taxId"
                                    name="taxId"
                                    defaultValue={subcontractor.taxId || ''}
                                    className="input-neumorphic w-full"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-medium text-[#333333]">
                                    Projects
                                </label>
                                <div className="card-neumorphic p-4 max-h-60 overflow-y-auto">
                                    {projects.map((project) => (
                                        <div key={project.id} className="flex items-center mb-3 last:mb-0">
                                            <input
                                                type="checkbox"
                                                id={`project-${project.id}`}
                                                name="projectIds"
                                                value={project.id}
                                                defaultChecked={currentProjectIds.includes(project.id)}
                                                className="w-4 h-4 accent-[#DA7756]"
                                            />
                                            <label htmlFor={`project-${project.id}`} className="ml-2 text-sm text-[#333333]">
                                                {project.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Link
                                href={`/subcontractors/${subcontractorId}`}
                                className="btn-neumorphic"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-neumorphic btn-primary"
                            >
                                Update Subcontractor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}