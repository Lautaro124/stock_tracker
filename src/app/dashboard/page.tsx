import { Metadata } from "next";
import { signOut } from "@/lib/actions/auth-actions";
import Link from "next/link";
import { getCurrentProject } from "@/lib/actions/project-actions";
import { getStockItems } from "@/lib/actions/stock-actions";
import StockItemList from "@/components/stocks/stock-item-list";

export const metadata: Metadata = {
  title: "Dashboard | Stock Tracker",
  description: "Tu panel de control para seguimiento de stock",
};

interface DashboardPageProps {
  searchParams: {
    projectId?: string;
  };
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const projectId = searchParams.projectId
    ? parseInt(searchParams.projectId)
    : 0;
  const selectedProject = await getCurrentProject(projectId);

  if (!selectedProject && projectId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-7xl mx-auto">
          <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6">
            <h1 className="text-2xl font-bold">Proyecto no encontrado</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              El proyecto que estás buscando no existe o no tienes acceso a él.
            </p>
          </header>
        </div>
      </div>
    );
  }

  const stockItems = selectedProject
    ? await getStockItems(selectedProject.id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bienvenido a tu panel de control
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Ver Proyectos
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>

        <main className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedProject.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proyecto #{selectedProject.id}
                </p>
              </div>
            </div>

            <StockItemList stocks={stockItems} projectId={selectedProject.id} />
          </div>
        </main>
      </div>
    </div>
  );
}
