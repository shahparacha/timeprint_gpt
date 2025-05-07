import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSubcontractorById } from '../actions';
import { getWorkersBySubcontractorId } from '@/app/workers/actions';
import { DeleteSubcontractorButton } from '@/app/components/delete-subcontractor-button';

interface SubcontractorPageProps {
    params: {
        subcontractorId: string;
    };
}

export default async function SubcontractorPage({ params }: SubcontractorPageProps) {

    const { subcontractorId } = await params;
    const subcontractor = await getSubcontractorById(subcontractorId);

    if (!subcontractor) {
        notFound();
    }

    const workers = await getWorkersBySubcontractorId(subcontractorId);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Link href="/subcontractors" className="text-[#DA7756] hover:opacity-80">
                    Subcontractors
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">{subcontractor.name}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#DA7756]">{subcontractor.name}</h1>
                <div className="flex gap-3">
                    <Link
                        href={`/subcontractors/${subcontractorId}/edit`}
                        className="btn-neumorphic btn-primary"
                    >
                        Edit
                    </Link>
                    <DeleteSubcontractorButton id={subcontractorId} />
                </div>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-[#DA7756]">Contact Information</h2>
                            <div className="space-y-2">
                                <p className="text-[#333333]">
                                    <span className="font-medium">Contact Name:</span>{' '}
                                    {subcontractor.contactName || 'Not provided'}
                                </p>
                                <p className="text-[#333333]">
                                    <span className="font-medium">Email:</span>{' '}
                                    {subcontractor.email || 'Not provided'}
                                </p>
                                <p className="text-[#333333]">
                                    <span className="font-medium">Phone:</span>{' '}
                                    {subcontractor.phone || 'Not provided'}
                                </p>
                                <p className="text-[#333333]">
                                    <span className="font-medium">Tax ID:</span>{' '}
                                    {subcontractor.taxId || 'Not provided'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-[#DA7756]">Address</h2>
                            <div className="space-y-1 text-[#333333]">
                                <p>
                                    {subcontractor.address || 'No address provided'}
                                    {subcontractor.unitNumber && `, Unit ${subcontractor.unitNumber}`}
                                </p>
                                <p>
                                    {[
                                        subcontractor.city,
                                        subcontractor.state,
                                        subcontractor.zipCode
                                    ]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                                <p>{subcontractor.country || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#DA7756]">Workers</h2>
                    <Link
                        href={`/workers/new?subcontractorId=${subcontractorId}`}
                        className="btn-neumorphic btn-primary"
                    >
                        Add Worker
                    </Link>
                </div>

                {workers.length === 0 ? (
                    <div className="card-neumorphic text-center p-8">
                        <p className="text-[#333333] mb-4">No workers found</p>
                        <Link
                            href={`/workers/new?subcontractorId=${subcontractorId}`}
                            className="btn-neumorphic btn-primary"
                        >
                            Add Worker
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {workers.map((worker) => (
                            <Link
                                href={`/workers/${worker.id}`}
                                key={worker.id}
                                className="card-neumorphic p-6 hover:opacity-90 transition"
                            >
                                <h3 className="text-lg font-medium text-[#DA7756]">
                                    {worker.firstName} {worker.lastName}
                                </h3>
                                {worker.email && (
                                    <p className="text-[#333333] mt-1">Email: {worker.email}</p>
                                )}
                                {worker.phone && (
                                    <p className="text-[#333333] mt-1">Phone: {worker.phone}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}