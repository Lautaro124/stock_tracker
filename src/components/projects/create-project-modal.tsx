"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createProject } from "@/lib/actions/project-actions";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await createProject(formData);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    if (result.success) {
      setSuccessMessage(result.success);
      // Cerrar modal después de 1 segundo cuando el proyecto se cree correctamente
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Crear nuevo proyecto</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <form action={handleSubmit} className="p-4">
          {errorMessage && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">
              {successMessage}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nombre del proyecto
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              placeholder="Ingresa el nombre del proyecto"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-70"
    >
      {pending ? "Creando..." : "Crear proyecto"}
    </button>
  );
}
