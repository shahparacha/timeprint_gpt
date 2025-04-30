import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWorkerById } from '@/app/workers/actions';
import { getWorkerIdentificationsByWorkerId } from '@/app/worker-identifications/actions';
import { getReportsByWorkerId } from '@/app/reports/actions';
import { DeleteWorkerButton } from '@/app/components/delete-worker-button';
import { DeleteWorkerIdentificationButton } from '@/app/components/delete-worker-identification-button';

interface WorkerPageProps {
    params: {
        workerId: string;
    };
}

export default async function WorkerPage({ params }: WorkerPageProps) {
    const { workerId } = params;
    const worker = await getWorkerById(workerId);

    if (!worker) {
        notFound();
    }

    const identifications = await getWorkerIdentificationsByWorkerId(workerId);
    const reports = await getReportsByWorkerId(workerId);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-4 text-sm">
                <Link href="/workers" className="text-[#DA7756] hover:opacity-80">
                    Workers
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">{worker.firstName} {worker.lastName}</span>
            </div>

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-[#DA7756]">{worker.firstName} {worker.lastName}</h1>
                <div className="flex gap-3">
                    <Link
                        href={`/workers/${workerId}/edit`}
                        className="btn-neumorphic btn-primary"
                    >
                        Edit
                    </Link>
                    <DeleteWorkerButton id={workerId} />
                </div>
            </div>

            <div className="card-neumorphic">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-[#DA7756]">Contact Information</h2>
                            <div className="space-y-2">
                                <p className="text-[#333333]">
                                    <span className="font-medium">Email:</span>{' '}
                                    {worker.email || 'Not provided'}
                                </p>
                                <p className="text-[#333333]">
                                    <span className="font-medium">Phone:</span>{' '}
                                    {worker.phone || 'Not provided'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-[#DA7756]">Associations</h2>
                            <div className="space-y-2">
                                <p className="text-[#333333]">
                                    <span className="font-medium">Subcontractor:</span>{' '}
                                    <Link href={`/subcontractors/${worker.subcontractorId}`} className="text-[#DA7756] hover:opacity-80">
                                        {worker.subcontractor?.name || worker.subcontractorId}
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#DA7756]">Identifications</h2>
                    <Link
                        href={`/worker-identifications/new?workerId=${workerId}`}
                        className="btn-neumorphic btn-primary"
                    >
                        Add Identification
                    </Link>
                </div>

                {identifications.length === 0 ? (
                    <div className="card-neumorphic text-center p-8">
                        <p className="text-[#333333] mb-4">No identifications found</p>
                        <Link
                            href={`/worker-identifications/new?workerId=${workerId}`}
                            className="btn-neumorphic btn-primary"
                        >
                            Add Identification
                        </Link>
                    </div>
                ) : (
                    <div className="card-neumorphic overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-[#CCCCCC]">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">File</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">Issue Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">Expiry Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-[#DA7756]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {identifications.map((identification) => (
                                    <tr key={identification.id} className="border-b border-[#CCCCCC] last:border-b-0">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={identification.filePath}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#DA7756] hover:opacity-80"
                                            >
                                                {identification.fileName}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                                            {identification.fileType}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                                            {identification.issueDate ? new Date(identification.issueDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                                            {identification.expiryDate ? new Date(identification.expiryDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/worker-identifications/${identification.id}/edit`}
                                                    className="text-[#DA7756] hover:opacity-80"
                                                >
                                                    Edit
                                                </Link>
                                                <DeleteWorkerIdentificationButton id={identification.id} workerId={workerId} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#DA7756]">Reports</h2>
                    <Link
                        href={`/reports/new?workerId=${workerId}`}
                        className="btn-neumorphic btn-primary"
                    >
                        Create Automated Reports
                    </Link>
                </div>

                {reports.length === 0 ? (
                    <div className="card-neumorphic text-center p-8">
                        <p className="text-[#333333] mb-4">No reports found</p>
                        <Link
                            href={`/reports/new?workerId=${workerId}`}
                            className="btn-neumorphic btn-primary"
                        >
                            Create Automated Reports
                        </Link>
                    </div>
                ) : (
                    <div className="card-neumorphic overflow-hidden">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-[#CCCCCC]">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">File</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">Report Date</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-[#DA7756]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id} className="border-b border-[#CCCCCC] last:border-b-0">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/reports/${report.id}`}
                                                className="text-[#DA7756] hover:opacity-80"
                                            >
                                                {report.title || 'Untitled Report'}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={report.filePath}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#DA7756] hover:opacity-80"
                                            >
                                                View File
                                            </a>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                                            {new Date(report.reportDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/reports/${report.id}/edit`}
                                                    className="text-[#DA7756] hover:opacity-80"
                                                >
                                                    Edit
                                                </Link>
                                                <Link
                                                    href={`/reports/${report.id}`}
                                                    className="text-red-600 hover:opacity-80"
                                                >
                                                    Delete
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}