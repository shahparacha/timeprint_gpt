import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorkerIdentificationById, updateWorkerIdentification } from '../../actions';

interface EditWorkerIdentificationPageProps {
    params: {
        workerIdentificationId: string;
    };
}

export default async function EditWorkerIdentificationPage({ params }: EditWorkerIdentificationPageProps) {
    const { workerIdentificationId } = params;
    const identification = await getWorkerIdentificationById(workerIdentificationId);

    if (!identification) {
        notFound();
    }

    const worker = identification.worker;

    async function handleUpdateIdentification(formData: FormData) {
        'use server';

        await updateWorkerIdentification(workerIdentificationId, formData);
        redirect(`/workers/${identification.workerId}`);
    }

    return (
        <div className="container mx-auto py-6">
            <Link
                href={`/workers/${identification.workerId}`}
                className="text-blue-600 hover:underline mb-6 block"
            >
                ← Back to {worker.firstName} {worker.lastName}
            </Link>

            <h1 className="text-3xl font-bold mb-6">Edit Identification Document</h1>

            <form action={handleUpdateIdentification} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="fileName" className="block text-sm font-medium text-gray-700">
                            Document Name*
                        </label>
                        <input
                            type="text"
                            id="fileName"
                            name="fileName"
                            required
                            defaultValue={identification.fileName}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Current Document
                        </label>
                        <a
                            href={identification.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-1 text-blue-600 hover:underline"
                        >
                            View Current Document
                        </a>
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            Replace Document (Optional)
                        </label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            className="mt-1 block w-full text-gray-700"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Upload a new scanned copy or photo of the identification document if you want to replace the current one.
                            Leave this empty to keep the current document.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
                            Issue Date
                        </label>
                        <input
                            type="date"
                            id="issueDate"
                            name="issueDate"
                            defaultValue={identification.issueDate ? new Date(identification.issueDate).toISOString().split('T')[0] : ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            id="expiryDate"
                            name="expiryDate"
                            defaultValue={identification.expiryDate ? new Date(identification.expiryDate).toISOString().split('T')[0] : ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Link
                        href={`/workers/${identification.workerId}`}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Update Document
                    </button>
                </div>
            </form>
        </div>
    );
}