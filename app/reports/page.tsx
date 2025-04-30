// app/reports/page.tsx
import Link from 'next/link';
import { getReports } from '@/app/reports/actions';

export default async function ReportsPage() {
  const reports = await getReports();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Reports</h1>
        <p className="text-[#333333]">
          View and manage project reports
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="card-neumorphic text-center p-8">
          <h3 className="text-xl font-medium mb-2 text-[#DA7756]">No reports found</h3>
          <p className="text-[#333333] mb-4">
            No reports have been submitted yet
          </p>
          <Link
            href="/reports/new"
            className="btn-neumorphic btn-primary inline-block"
          >
            Create Automated Reports
          </Link>
        </div>
      ) : (
        <div className="card-neumorphic overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#CCCCCC]">
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">
                    Worker
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#DA7756]">
                    Report Date
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-[#DA7756]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-[#CCCCCC] last:border-b-0 hover:bg-[#F5F5F5] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/reports/${report.id}`}
                        className="text-[#DA7756] hover:opacity-80"
                      >
                        {report.title || 'Untitled Report'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/projects/${report.projectId}`}
                        className="text-[#DA7756] hover:opacity-80"
                      >
                        {report.project?.name || report.projectId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/workers/${report.workerId}`}
                        className="text-[#DA7756] hover:opacity-80"
                      >
                        {`${report.worker?.firstName || ''} ${report.worker?.lastName || ''}` || report.workerId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#333333]">
                      {new Date(report.reportDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/reports/${report.id}`}
                        className="text-[#DA7756] hover:opacity-80"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Report Button */}
      <div className="mt-6">
        <Link
          href="/reports/new"
          className="btn-neumorphic btn-primary inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Automated Reports
        </Link>
      </div>
    </div>
  );
}