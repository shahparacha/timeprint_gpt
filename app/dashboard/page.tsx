import Link from 'next/link';
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Dashboard</h1>
        <p className="text-[#333333]">
          Welcome back, {user.firstName}!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/projects" className="card-neumorphic p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#DA7756] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#DA7756]">Projects</h3>
              <p className="text-sm text-[#333333]">Manage your projects</p>
            </div>
          </div>
        </Link>

        <Link href="/reports" className="card-neumorphic p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#DA7756] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#DA7756]">Reports</h3>
              <p className="text-sm text-[#333333]">View project reports</p>
            </div>
          </div>
        </Link>

        <Link href="/workers" className="card-neumorphic p-6 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#DA7756] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#DA7756]">Workers</h3>
              <p className="text-sm text-[#333333]">Manage workers</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Organization Info */}
      <div className="card-neumorphic p-6">
        <h2 className="text-xl font-medium mb-4 text-[#DA7756]">Organization Settings</h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/organization"
            className="text-[#DA7756] hover:opacity-80 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Manage Organization
          </Link>
          <Link
            href="/profile"
            className="text-[#DA7756] hover:opacity-80 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}