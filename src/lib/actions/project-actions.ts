"use server";

import { Project } from "@/interface/project";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserProjects() {
  const supabase = await createClient();

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Usuario no autenticado" };

  // Obtener proyectos a los que el usuario tiene acceso a través de los permisos
  const { data: permissions, error: permissionsError } = await supabase
    .from("Projects_permisions")
    .select(
      `
      project_id,
      Projects:project_id (
        id,
        name
      )
    `
    )
    .eq("user_id", user.id);

  if (permissionsError) {
    return { error: permissionsError.message };
  }

  // Extraer proyectos únicos de los permisos
  const projects = permissions?.map((p) => p.Projects as unknown as Project) || [];

  return { projects };
}

export const getCurrentProject = async (projectId: number): Promise<Project> => {
  const supabase = await createClient();
  const {data : { user }} = await supabase.auth.getUser();
  const { data: project, error } = await supabase
    .from("Projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) {
    throw { error: error.message };
  }

  if (project) {
    const { data: permissions, error: permissionError } = await supabase
      .from("Projects_permisions")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user?.id)
      .single();

    if (permissionError && !permissions) {
      throw { error: permissionError.message };
    }
  }

  return project;
};

// Crear un nuevo proyecto
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;

  if (!name || name.trim() === "") {
    return { error: "El nombre del proyecto es obligatorio" };
  }

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Usuario no autenticado" };

  // Crear el proyecto en una transacción
  // 1. Insertar el proyecto
  const { data: project, error: projectError } = await supabase
    .from("Projects")
    .insert({ name })
    .select()
    .single();

  if (projectError) {
    return { error: projectError.message };
  }

  // 2. Dar permiso al usuario que lo creó
  const { error: permissionError } = await supabase
    .from("Projects_permisions")
    .insert({
      user_id: user.id,
      project_id: project.id,
    });

  if (permissionError) {
    // Intenta eliminar el proyecto si no se pudo asignar el permiso
    await supabase.from("Projects").delete().eq("id", project.id);
    return { error: permissionError.message };
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath("/projects");

  return { success: "Proyecto creado correctamente", project };
}
