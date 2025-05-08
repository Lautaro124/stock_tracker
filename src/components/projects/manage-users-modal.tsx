"use client";

import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  addUserToProject,
  getProjectUsers,
  removeUserFromProject,
} from "@/lib/actions/project-actions";

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
}

interface ProjectUser {
  id: string;
  email: string;
  type: "member";
}

interface ProjectInvitation {
  id: string;
  email: string;
  status: string;
  date: string;
  type: "invitation";
}

export default function ManageUsersModal({
  isOpen,
  onClose,
  projectId,
  projectName,
}: ManageUsersModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, projectId]);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const { users, invitations, error } = await getProjectUsers(projectId);
      if (error) {
        setErrorMessage(error);
      } else {
        setUsers(users as ProjectUser[]);
        setInvitations(invitations as ProjectInvitation[]);
      }
    } catch (error) {
      setErrorMessage("Error al cargar usuarios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddUser(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = formData.get("email") as string;
    if (!email || !email.includes("@")) {
      setErrorMessage("Por favor, introduce un correo electrónico válido");
      return;
    }

    try {
      const result = await addUserToProject(projectId, email);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage(result.success);
        // Limpiar el campo del formulario
        const inputElement = document.getElementById(
          "email"
        ) as HTMLInputElement;
        if (inputElement) inputElement.value = "";

        await loadUsers(); // Actualizar la lista de usuarios
      }
    } catch (error) {
      setErrorMessage("Error al agregar usuario");
      console.error(error);
    }
  }

  async function handleRemoveUser(userId: string, userEmail: string) {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar a ${userEmail} del proyecto?`
      )
    ) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await removeUserFromProject(projectId, userId);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage(result.success);
        await loadUsers(); // Actualizar la lista de usuarios
      }
    } catch (error) {
      setErrorMessage("Error al eliminar usuario");
      console.error(error);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 max-w-md w-full rounded-lg shadow-xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Gestionar usuarios</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm mb-4">
            Proyecto: <strong>{projectName}</strong>
          </p>

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

          <form action={handleAddUser} className="mb-6">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Invitar usuario por correo electrónico
              </label>
              <div className="flex gap-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  required
                />
                <AddUserButton />
              </div>
            </div>
          </form>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Usuarios con acceso</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Cargando usuarios...
                </p>
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                No hay usuarios para mostrar.
              </p>
            ) : (
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <span className="text-sm truncate flex-1">
                      {user.email}
                    </span>
                    <button
                      onClick={() => handleRemoveUser(user.id, user.email)}
                      className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 text-sm"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {invitations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Invitaciones pendientes</h3>
              <ul className="space-y-2 max-h-40 overflow-y-auto">
                {invitations.map((invitation) => (
                  <li
                    key={invitation.id}
                    className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md"
                  >
                    <div className="flex-1">
                      <span className="text-sm truncate block">
                        {invitation.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Invitado el:{" "}
                        {new Date(invitation.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                      Pendiente
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddUserButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-70 whitespace-nowrap"
    >
      {pending ? "Invitando..." : "Invitar"}
    </button>
  );
}
