import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Permisos de Proyectos | Stock Tracker",
  description: "Configuración de la estructura de permisos de proyectos",
};

export default async function ProjectPermisionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Configuración de Permisos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configurar estructura de base de datos para permisos de
                proyectos
              </p>
            </div>
            <div>
              <Link
                href="/projects"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Volver a Proyectos
              </Link>
            </div>
          </div>
        </header>

        <main className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Estructura de Tabla Projects_permisions
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Para que la gestión de usuarios de proyectos funcione
                correctamente, necesitamos asegurarnos de que la tabla tiene la
                estructura adecuada.
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-md font-medium mb-2">Campos necesarios:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                      project_id
                    </code>{" "}
                    - ID del proyecto (referencia a Projects.id)
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                      user_id
                    </code>{" "}
                    - ID del usuario (referencia a auth.users.id)
                  </li>
                  <li>
                    <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
                      user_email
                    </code>{" "}
                    - Email del usuario (para facilitar consultas)
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-md font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Instrucciones para Supabase
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Ejecuta el siguiente SQL en el Editor SQL de Supabase para
                actualizar la estructura:
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                {`-- Añadir campo user_email si no existe
ALTER TABLE "Projects_permisions" 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Actualizar los permisos existentes (esto requiere datos de usuarios)
-- Este paso debes adaptarlo según tu estructura de datos
UPDATE "Projects_permisions" pp
SET user_email = au.email
FROM auth.users au
WHERE pp.user_id = au.id::text;

-- Para futuros inserts, puedes usar un trigger para actualizar automáticamente el email
CREATE OR REPLACE FUNCTION set_user_email()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_email := (SELECT email FROM auth.users WHERE id::text = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear o reemplazar el trigger
DROP TRIGGER IF EXISTS set_user_email_trigger ON "Projects_permisions";
CREATE TRIGGER set_user_email_trigger
BEFORE INSERT ON "Projects_permisions"
FOR EACH ROW
EXECUTE FUNCTION set_user_email();
`}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
