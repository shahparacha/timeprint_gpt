"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteWorkerIdentification } from "@/app/worker-identifications/actions";

export function DeleteWorkerIdentificationButton({ id, workerId }: { id: string, workerId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this identification document?")) {
            return;
        }

        setIsDeleting(true);
        await deleteWorkerIdentification(id);
        router.refresh();
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Delete"}
        </button>
    );
}