import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getProjects } from "./actions";

export default async function ProjectsPage() {
  // Get the authenticated user and their organization with session claims
  const { userId, orgId, sessionClaims } = await auth();
  const user = await currentUser();
  console.log("orgId", orgId);

  // Redirect if not authenticated
  if (!userId || !user) {
    redirect("/sign-in");
  }

  // Redirect if no organization
  if (!orgId) {
    redirect("/select-org");
  }

  // Get organization name from session claims
  const orgName = sessionClaims.org_name || "Organization's";

  // Fetch projects using the action
  const projects = await getProjects();
  console.log("Projects in page component:", projects);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">
          {orgName} Projects
        </h1>
        <p className="text-[#333333]">
          Welcome, {user.firstName}! View and manage projects for your organization.
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="card-neumorphic text-center p-8">
          <h3 className="text-xl font-medium mb-2 text-[#DA7756]">No projects found</h3>
          <p className="text-[#333333] mb-4">
            Your organization doesn't have any projects yet.
          </p>
          <Link
            href="/projects/new"
            className="btn-neumorphic btn-primary inline-block"
          >
            Create a new project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card-neumorphic transition-all hover:shadow-lg"
            >
              <Link href={`/projects/${project.id}`} className="block p-6">
                <h3 className="text-xl font-semibold mb-2 truncate text-[#DA7756]">{project.name}</h3>
                {project.description && (
                  <p className="text-[#333333] mb-4 line-clamp-2">{project.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.address && (
                    <div className="flex items-center text-sm text-[#333333]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="truncate">
                        {project.address}
                        {project.city && `, ${project.city}`}
                        {project.state && `, ${project.state}`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm text-[#333333] border-t border-[#CCCCCC] pt-4">
                  <span>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center text-[#DA7756]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    View details
                  </span>
                </div>
              </Link>
            </div>
          ))}

          <Link
            href="/projects/new"
            className="card-neumorphic p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-[#DA7756] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1 text-[#DA7756]">Create a new project</h3>
            <p className="text-[#333333] text-sm">Add a new project to your organization</p>
          </Link>
        </div>
      )}
    </div>
  );
}