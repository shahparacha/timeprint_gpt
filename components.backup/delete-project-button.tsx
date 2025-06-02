// app/components/delete-project-button.tsx
'use client';

import { useState } from "react";
import { deleteProject } from "@/app/projects/actions";

interface DeleteProjectButtonProps {
    id: string;
}

export function DeleteProjectButton({ id }: DeleteProjectButtonProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);
            // Let the server action handle the redirect
            await deleteProject(id);
        } catch (error) {
            console.error("Error deleting project:", error);
            setIsDeleting(false);
            setIsConfirming(false);
        }
    };

    if (isConfirming) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn-neumorphic text-[#333333] hover:text-[#DA7756] hover:bg-[#F5F5F5] transition-all"
                >
                    {isDeleting ? "Deleting..." : "Confirm"}
                </button>
                <button
                    onClick={() => setIsConfirming(false)}
                    disabled={isDeleting}
                    className="btn-neumorphic text-[#333333] hover:text-[#DA7756] hover:bg-[#F5F5F5] transition-all"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className="btn-neumorphic text-[#333333] hover:text-[#DA7756] hover:bg-[#F5F5F5] transition-all"
        >
            Delete Project
        </button>
    );
}