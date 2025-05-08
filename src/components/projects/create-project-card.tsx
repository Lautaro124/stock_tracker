"use client";

import { useState } from "react";
import CreateProjectModal from "./create-project-modal";
import { PlusIcon } from "lucide-react";

export default function CreateProjectCard() {
  const [isOpen, setIsOpen] = useState(false);

  // Abrir modal para crear proyecto
  const handleCreateNew = () => {
    setIsOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsOpen(false);
    window.location.href = window.location.pathname;
  };

  return (
    <>
      <button onClick={handleCreateNew} className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 h-full flex items-center justify-center gap-1.5 text-center bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <span>Crear nuevo proyecto</span>
        <PlusIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      <CreateProjectModal isOpen={isOpen} onClose={handleCloseModal} />
    </>
  );
}
