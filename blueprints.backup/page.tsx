import Link from 'next/link';
import { getBlueprints } from './actions';

export default async function BlueprintsPage() {
  const blueprints = await getBlueprints();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">Blueprints</h1>
        <p className="text-[#333333]">
          View and manage project blueprints
        </p>
      </div>

      {blueprints.length === 0 ? (
        <div className="card-neumorphic text-center p-8">
          <h3 className="text-xl font-medium mb-2 text-[#DA7756]">No blueprints found</h3>
          <p className="text-[#333333] mb-4">
            Start by adding your first blueprint
          </p>
          <Link
            href="/blueprints/new"
            className="btn-neumorphic btn-primary inline-block"
          >
            Add Blueprint
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint) => (
            <div
              key={blueprint.id}
              className="card-neumorphic transition-all hover:shadow-lg"
            >
              <Link href={`/blueprints/${blueprint.id}`} className="block p-6">
                <h3 className="text-xl font-semibold mb-2 truncate text-[#DA7756]">
                  {blueprint.title}
                </h3>
                <div className="space-y-2 text-[#333333]">
                  <p className="text-sm">
                    Project: {blueprint.project?.name || blueprint.projectId}
                  </p>
                  <p className="text-sm">
                    Type: {blueprint.fileType}
                  </p>
                  <p className="text-sm">
                    Created: {new Date(blueprint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </div>
          ))}

          <Link
            href="/blueprints/new"
            className="card-neumorphic p-6 text-center flex flex-col items-center justify-center hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-[#DA7756] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1 text-[#DA7756]">Add Blueprint</h3>
            <p className="text-[#333333] text-sm">Upload a new blueprint</p>
          </Link>
        </div>
      )}
    </div>
  );
}