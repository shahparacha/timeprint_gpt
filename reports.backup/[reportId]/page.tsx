import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReportById } from '../actions';
import { DeleteReportButton } from '@/app/components/delete-report-button';

interface ReportPageProps {
    params: {
        reportId: string;
    };
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { reportId } = params;
    const report = await getReportById(reportId);

    if (!report) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/reports" className="text-[#DA7756] hover:opacity-80">
                    Reports
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">{report.title || 'Untitled Report'}</span>
            </div>

            {/* Header Section */}
            <div className="card-neumorphic mb-6">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">
                                {report.title || 'Untitled Report'}
                            </h1>
                            <p className="text-[#333333]">
                                Report details and information
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/reports/${reportId}/edit`}
                                className="btn-neumorphic"
                            >
                                Edit Report
                            </Link>
                            <DeleteReportButton id={reportId} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Details Card */}
                <div className="card-neumorphic p-6">
                    <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Report Details</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">Report Date</span>
                            <span className="text-[#333333]">
                                {new Date(report.reportDate).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">File Type</span>
                            <span className="text-[#333333]">{report.fileType}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">File Size</span>
                            <span className="text-[#333333]">
                                {report.fileSize ? `${Math.round(report.fileSize / 1024)} KB` : 'Unknown'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Associations Card */}
                <div className="card-neumorphic p-6">
                    <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Associations</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">Project</span>
                            <Link
                                href={`/projects/${report.projectId}`}
                                className="text-[#DA7756] hover:opacity-80"
                            >
                                {report.project?.name || report.projectId}
                            </Link>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">Worker</span>
                            <Link
                                href={`/workers/${report.workerId}`}
                                className="text-[#DA7756] hover:opacity-80"
                            >
                                {`${report.worker?.firstName || ''} ${report.worker?.lastName || ''}` || report.workerId}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Report Button */}
            <div className="mt-6">
                <a
                    href={report.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neumorphic btn-primary inline-block"
                >
                    View Report Document
                </a>
            </div>
        </div>
    );
}