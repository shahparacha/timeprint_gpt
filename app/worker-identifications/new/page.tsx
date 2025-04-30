import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getWorkerById } from '@/app/workers/actions';
import { createWorkerIdentification } from '../actions';

export default async function NewWorkerIdentificationPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    // Handle pre-selected worker ID from query parameters
    const workerId = typeof searchParams.workerId === 'string' ? searchParams.workerId : undefined;

    if (!workerId) {
        return (
            <div className="container mx-auto py-6">
                <h1 className="text-3xl font-bold mb-6">Add Worker Identification</h1>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <p className="text-yellow-700">
                        A worker must be selected to add an identification document. Please select a worker first.
                    </p>
                </div>
                <Link href="/workers" className="text-blue-600 hover:underline">
                    Go to Workers
                </Link>
            </div>
        );
    }

    const worker = await getWorkerById(workerId);

    if (!worker) {
        redirect('/workers');
    }

    async function handleCreateIdentification(formData: FormData) {
        'use server';

        await createWorkerIdentification(formData);
        redirect(`/workers/${workerId}`);
    }

    return (
        <div className="container mx-auto py-6">
            <Link href={`/workers/${workerId}`} className="text-blue-600 hover:underline mb-6 block">
                ← Back to {worker.firstName} {worker.lastName}
            </Link>

            <h1 className="text-3xl font-bold mb-6">Add New Identification Document</h1>

            <form action={handleCreateIdentification} className="bg-white p-6 rounded-lg border border-gray-200">
                <input type="hidden" name="workerId" value={workerId} />

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
                            placeholder="E.g. Driver's License, Passport, Work Permit"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                            Document File*
                        </label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            required
                            className="mt-1 block w-full text-gray-700"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Upload a scanned copy or photo of the identification document. Supported formats: PDF, JPG, PNG.
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <Link
                        href={`/workers/${workerId}`}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Upload Document
                    </button>
                </div>
            </form>
        </div>
    );
}