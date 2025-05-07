import Link from "next/link";
import { UserButtonClient } from "./UserButtonClient";

// This will be our client component
export default function Header({ userId }: { userId: string | null }) {
  return (
    <nav className="nav-neumorphic py-4 px-6 flex items-center justify-between mb-5 sticky top-0 z-10">
      <div className="flex items-center">
        <Link href="/" className="flex items-center">
          <div className="brand-logo">
            <img
              src="/logo.png"
              alt="BuildGPT Logo"
              className="h-8 w-auto"
            />
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {!userId && (
          <>
            <Link href="/sign-in" className="nav-link">Sign In</Link>
            <Link href="/sign-up" className="nav-link">Sign Up</Link>
            <img
              src="/logo2.png"
              alt="Logo"
              className="h-8 w-8 rounded-full border-2 border-white"
            />
          </>
        )}
        {userId && (
          <>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/chat" className="nav-link">Ask Anything</Link>
            <Link href="/profile" className="nav-link">Profile</Link>
            <Link href="/organization" className="nav-link">Organization</Link>
            <Link href="/projects" className="nav-link">Projects</Link>
            <Link href="/reports" className="nav-link">Reports</Link>
            <Link href="/blueprints" className="nav-link">Blueprints</Link>
            <Link href="/subcontractors" className="nav-link">Subcontractors</Link>
            <Link href="/workers" className="nav-link">Workers</Link>
            <div className="user-button-wrapper ml-4">
              <UserButtonClient />
            </div>
          </>
        )}
      </div>
    </nav>
  );
}