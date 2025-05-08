import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "@/components/auth/auth-form";
import { signUp } from "@/lib/actions/auth-actions";

export const metadata: Metadata = {
  title: "Registro | Stock Tracker",
  description: "Crea una nueva cuenta en Stock Tracker",
};

export default async function SignUpPage() {
  // Comprobar si el usuario ya está autenticado
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (data?.session) {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-md mb-8 text-center">
        <Link href="/" className="inline-block">
          <Image
            src="/next.svg"
            alt="Stock Tracker Logo"
            width={150}
            height={32}
            className="dark:invert mx-auto"
          />
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Únete a Stock Tracker para gestionar tus inversiones
        </p>
      </div>

      <AuthForm
        formAction={signUp}
        submitLabel="Registrarse"
        linkHref="/auth/sign-in"
        linkText="¿Ya tienes cuenta? Inicia sesión"
      />

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:underline">
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
