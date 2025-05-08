"use client";

import { useState } from "react";
import { UsersIcon } from "lucide-react";
import ManageUsersModal from "./manage-users-modal";

interface ManageProjectUsersProps {
  projectId: number;
  projectName: string;
}

export default function ManageProjectUsers({
  projectId,
  projectName,
}: ManageProjectUsersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
      >
        <UsersIcon size={16} />
        <span>Gestionar usuarios</span>
      </button>

      <ManageUsersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
}
