"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProject } from "@/app/projects/actions";

export function DeleteProjectButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this project?")) {
            return;
        }

        setIsDeleting(true);
        await deleteProject(id);
        router.push("/projects");
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-neumorphic text-red-600 hover:text-red-700 disabled:opacity-50"
        >
            {isDeleting ? "Deleting..." : "Delete Project"}
        </button>
    );
}