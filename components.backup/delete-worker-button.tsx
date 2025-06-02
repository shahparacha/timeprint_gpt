"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteWorker } from "@/app/workers/actions";

export function DeleteWorkerButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this worker?")) {
            return;
        }

        setIsDeleting(true);
        await deleteWorker(id);
        router.push("/workers");
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}