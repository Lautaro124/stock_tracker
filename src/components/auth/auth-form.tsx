"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

interface AuthFormProps {
  formAction: (
    formData: FormData
  ) => Promise<{ error?: string; success?: string }>;
  submitLabel: string;
  linkHref: string;
  linkText: string;
}

export default function AuthForm({
  formAction,
  submitLabel,
  linkHref,
  linkText,
}: AuthFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await formAction(formData);

    if (result.error) {
      setErrorMessage(result.error);
    }

    if (result.success) {
      setSuccessMessage(result.success);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <form action={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <SubmitButton label={submitLabel} />

        <div className="text-sm text-center mt-4">
          <Link
            href={linkHref}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            {linkText}
          </Link>
        </div>
      </form>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors disabled:opacity-70"
    >
      {pending ? "Cargando..." : label}
    </button>
  );
}
