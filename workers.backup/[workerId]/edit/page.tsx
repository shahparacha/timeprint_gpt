import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorkerById, updateWorker } from '../../actions';

interface EditWorkerPageProps {
    params: {
        workerId: string;
    };
}

export default async function EditWorkerPage({ params }: EditWorkerPageProps) {
    const { workerId } = params;
    const worker = await getWorkerById(workerId);

    if (!worker) {
        notFound();
    }

    async function handleUpdateWorker(formData: FormData) {
        'use server';

        await updateWorker(workerId, formData);
        redirect(`/workers/${workerId}`);
    }

    return (
        <div className="container mx-auto py-6">
            <Link href={`/workers/${workerId}`} className="text-blue-600 hover:underline mb-6 block">
                ← Back to Worker
            </Link>

            <h1 className="text-3xl font-bold mb-6">Edit Worker</h1>

            <form action={handleUpdateWorker} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name*
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            required
                            defaultValue={worker.firstName}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name*
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            required
                            defaultValue={worker.lastName}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            defaultValue={worker.email || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            defaultValue={worker.phone || ''}
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
                        Update Worker
                    </button>
                </div>
            </form>
        </div>
    );
}