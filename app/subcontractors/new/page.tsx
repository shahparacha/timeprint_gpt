import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from "@clerk/nextjs/server";
import { getProjects } from '@/app/projects/actions';
import { createSubcontractorWithRedirect } from '../actions';

export default async function NewSubcontractorPage() {
    const { userId, orgId } = await auth();
    const projects = await getProjects();

    if (!userId || !orgId) {
        redirect("/sign-in");
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Link href="/subcontractors" className="text-[#DA7756] hover:opacity-80">
                    Subcontractors
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">New Subcontractor</span>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-6 text-[#DA7756]">Add New Subcontractor</h1>

                    <form action={createSubcontractorWithRedirect} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-[#333333] mb-1">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        className="input-neumorphic w-full"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="contactName" className="block text-sm font-medium text-[#333333] mb-1">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        id="contactName"
                                        name="contactName"
                                        className="input-neumorphic w-full"
                                        placeholder="Enter contact name"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-[#333333] mb-1">
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
                                    <label htmlFor="phone" className="block text-sm font-medium text-[#333333] mb-1">
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
                            </div>

                            <div>
                                <label htmlFor="projects" className="block text-sm font-medium text-[#333333] mb-1">
                                    Projects
                                </label>
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

                            <div>
                                <h3 className="text-lg font-medium mb-3 text-[#DA7756]">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label htmlFor="address" className="block text-sm font-medium text-[#333333] mb-1">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            className="input-neumorphic w-full"
                                            placeholder="Street address"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="unitNumber" className="block text-sm font-medium text-[#333333] mb-1">
                                            Unit/Suite Number
                                        </label>
                                        <input
                                            type="text"
                                            id="unitNumber"
                                            name="unitNumber"
                                            className="input-neumorphic w-full"
                                            placeholder="Unit/Suite number"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-[#333333] mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            className="input-neumorphic w-full"
                                            placeholder="City"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-[#333333] mb-1">
                                            State/Province
                                        </label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            className="input-neumorphic w-full"
                                            placeholder="State/Province"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="country" className="block text-sm font-medium text-[#333333] mb-1">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            className="input-neumorphic w-full"
                                            placeholder="Country"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-[#333333] mb-1">
                                            Zip/Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            id="zipCode"
                                            name="zipCode"
                                            className="input-neumorphic w-full"
                                            placeholder="Zip/Postal code"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="taxId" className="block text-sm font-medium text-[#333333] mb-1">
                                    Tax ID
                                </label>
                                <input
                                    type="text"
                                    id="taxId"
                                    name="taxId"
                                    className="input-neumorphic w-full"
                                    placeholder="Enter tax ID"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="btn-neumorphic btn-primary"
                            >
                                Create Subcontractor
                            </button>

                            <Link
                                href="/subcontractors"
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