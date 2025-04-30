import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlueprintById } from '../actions';
import { DeleteBlueprintButton } from '@/app/components/delete-blueprint-button';

interface BlueprintPageProps {
    params: {
        blueprintId: string;
    };
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
    const { blueprintId } = params;
    const blueprint = await getBlueprintById(blueprintId);

    if (!blueprint) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6 text-sm">
                <Link href="/blueprints" className="text-[#DA7756] hover:opacity-80">
                    Blueprints
                </Link>
                <span className="text-[#333333]">/</span>
                <span className="text-[#333333] font-medium">{blueprint.title}</span>
            </div>

            {/* Header Section */}
            <div className="card-neumorphic mb-6">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold mb-2 text-[#DA7756]">{blueprint.title}</h1>
                            <p className="text-[#333333]">
                                Blueprint details and information
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href={`/blueprints/${blueprintId}/edit`}
                                className="btn-neumorphic"
                            >
                                Edit Blueprint
                            </Link>
                            <DeleteBlueprintButton id={blueprintId} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blueprint Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Details Card */}
                <div className="card-neumorphic p-6">
                    <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Blueprint Details</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">File Type</span>
                            <span className="text-[#333333]">{blueprint.fileType}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">File Size</span>
                            <span className="text-[#333333]">
                                {blueprint.fileSize ? `${Math.round(blueprint.fileSize / 1024)} KB` : 'Unknown'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">Uploaded</span>
                            <span className="text-[#333333]">
                                {new Date(blueprint.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Project Card */}
                <div className="card-neumorphic p-6">
                    <h3 className="text-lg font-medium mb-4 text-[#DA7756]">Project Information</h3>
                    <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-sm text-[#333333] font-medium">Project</span>
                            <Link
                                href={`/projects/${blueprint.projectId}`}
                                className="text-[#DA7756] hover:opacity-80"
                            >
                                {blueprint.project?.name || blueprint.projectId}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Blueprint Button */}
            <div className="mt-6">
                <a
                    href={blueprint.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-neumorphic btn-primary inline-block"
                >
                    View Blueprint
                </a>
            </div>
        </div>
    );
} 