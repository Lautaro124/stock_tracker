import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getUserProjects } from "@/lib/actions/project-actions";
import CreateProjectCard from "@/components/projects/create-project-card";
import { Suspense } from "react";
import LoadSpinner from "@/components/loadin-spiner/load-spiner";

export const metadata: Metadata = {
  title: "Proyectos | Stock Tracker",
  description: "Gestiona tus proyectos de seguimiento de stock",
};

interface ProjectsPageProps {
  searchParams: {
    id?: string;
  };
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const { projects, error } = await getUserProjects();

  const currentProjectId = searchParams.id
    ? parseInt(searchParams.id)
    : undefined;

  if (
    currentProjectId &&
    projects &&
    !projects.some((p) => p.id === currentProjectId)
  ) {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Proyectos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestiona tus proyectos de seguimiento de stock
              </p>
            </div>
          </div>
        </header>
        <Suspense fallback={<LoadSpinner />}>
          <main className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
            {error ? (
              <div className="p-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
                Error al cargar proyectos: {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mostrar proyectos existentes */}
                {projects?.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard?projectId=${project.id}`}
                    className="block"
                  >
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 h-full bg-white dark:bg-gray-800 cursor-pointer">
                      <h3 className="text-xl font-semibold mb-2">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ID del proyecto: {project.id}
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                          Ver dashboard →
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                <CreateProjectCard />
              </div>
            )}
          </main>
        </Suspense>
      </div>
    </div>
  );
}
