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
  const projects =
    permissions?.map((p) => p.Projects as unknown as Project) || [];

  return { projects };
}

export const getCurrentProject = async (
  projectId: number
): Promise<Project | null> => {
  if (!projectId) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data: project, error } = await supabase
      .from("Projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error al obtener el proyecto:", error.message);
      return null;
    }

    if (project) {
      try {
        const { data: permissions } = await supabase
          .from("Projects_permisions")
          .select("*")
          .eq("project_id", projectId)
          .eq("user_id", user?.id)
          .single();

        if (!permissions) {
          console.error("El usuario no tiene permisos para este proyecto");
          return null;
        }
      } catch (error) {
        console.error("Error al verificar permisos:", error);
        return null;
      }
    }

    return project;
  } catch (error) {
    console.error("Error al obtener el proyecto:", error);
    return null;
  }
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

// Agregar un usuario a un proyecto
export async function addUserToProject(projectId: number, email: string) {
  const supabase = await createClient();

  // Verificar que el usuario actual tenga permisos para este proyecto
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) return { error: "Usuario no autenticado" };

  // Verificar permisos del usuario actual
  const { data: hasPermission } = await supabase
    .from("Projects_permisions")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", currentUser.id)
    .single();

  if (!hasPermission) {
    return { error: "No tienes permisos para administrar este proyecto" };
  }

  // Si el usuario actual está intentando agregarse a sí mismo de nuevo
  if (currentUser.email === email) {
    return { error: "Ya tienes acceso a este proyecto" };
  }

  try {
    // Crear un registro de invitación en una tabla separada
    const { error: invitationError } = await supabase
      .from("Project_invitations")
      .insert({
        project_id: projectId,
        invited_email: email,
        invited_by: currentUser.id,
        status: "pending",
      })
      .select()
      .single();

    if (invitationError) {
      // Si hay un error de llave única, probablemente el usuario ya está invitado
      if (invitationError.code === "23505") {
        // Código para violación de restricción única
        return { error: "Este email ya ha sido invitado a este proyecto" };
      }
      return { error: invitationError.message };
    }

    // En una aplicación real, aquí enviaríamos un email de invitación al usuario
    // Para nuestro caso, simplemente almacenamos la invitación y mostraremos un mensaje

    // Revalidar la ruta para actualizar los datos
    revalidatePath(`/projects`);
    revalidatePath(`/dashboard?projectId=${projectId}`);

    return {
      success: `Se ha enviado una invitación a ${email} para unirse al proyecto`,
    };
  } catch (error) {
    console.error("Error al invitar usuario:", error);
    return { error: "Error al procesar la invitación al proyecto" };
  }
}

// Obtener usuarios con permiso en un proyecto
export async function getProjectUsers(projectId: number) {
  const supabase = await createClient();

  // Verificar que el usuario actual tenga permisos para este proyecto
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser)
    return { error: "Usuario no autenticado", users: [], invitations: [] };

  // Verificar permisos del usuario actual
  const { data: hasPermission } = await supabase
    .from("Projects_permisions")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", currentUser.id)
    .single();

  if (!hasPermission) {
    return {
      error: "No tienes permisos para ver este proyecto",
      users: [],
      invitations: [],
    };
  }

  try {
    // Obtener todos los usuarios con permisos para este proyecto
    const { data: permissions, error: permissionsError } = await supabase
      .from("Projects_permisions")
      .select(`user_id`)
      .eq("project_id", projectId);

    if (permissionsError) {
      console.error("Error al obtener permisos:", permissionsError);
      return { error: permissionsError.message, users: [], invitations: [] };
    }

    // Obtener invitaciones pendientes para este proyecto
    const { data: pendingInvitations, error: invitationsError } = await supabase
      .from("Project_invitations")
      .select(`id, invited_email, status, created_at`)
      .eq("project_id", projectId)
      .eq("status", "pending");

    if (invitationsError) {
      console.error("Error al obtener invitaciones:", invitationsError);
    }

    // Si no hay permisos ni invitaciones
    if (
      (!permissions || permissions.length === 0) &&
      (!pendingInvitations || pendingInvitations.length === 0)
    ) {
      return { users: [], invitations: [] };
    }

    // Procesar usuarios con permisos
    const users = permissions.map((permission) => {
      // Para el usuario actual, podemos mostrar su email
      if (permission.user_id === currentUser.id) {
        return {
          id: permission.user_id,
          email: currentUser.email,
          type: "member",
        };
      }
      // Para otros usuarios, solo mostramos una versión enmascarada de su ID
      return {
        id: permission.user_id,
        email: `Usuario #${permission.user_id.substring(0, 8)}...`,
        type: "member",
      };
    });

    // Procesar invitaciones pendientes
    const invitations = pendingInvitations
      ? pendingInvitations.map((invitation) => ({
          id: invitation.id,
          email: invitation.invited_email,
          status: invitation.status,
          date: invitation.created_at,
          type: "invitation",
        }))
      : [];

    return { users, invitations };
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      error: "Error al obtener la lista de usuarios y invitaciones",
      users: [],
      invitations: [],
    };
  }
}

// Eliminar usuario de un proyecto
export async function removeUserFromProject(projectId: number, userId: string) {
  const supabase = await createClient();

  // Verificar que el usuario actual tenga permisos para este proyecto
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  if (!currentUser) return { error: "Usuario no autenticado" };

  // No permitir que un usuario se elimine a sí mismo
  if (userId === currentUser.id) {
    return { error: "No puedes eliminarte a ti mismo del proyecto" };
  }

  // Verificar permisos del usuario actual
  const { data: hasPermission } = await supabase
    .from("Projects_permisions")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", currentUser.id)
    .single();

  if (!hasPermission) {
    return { error: "No tienes permisos para administrar este proyecto" };
  }

  // Eliminar permiso
  const { error: permissionError } = await supabase
    .from("Projects_permisions")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (permissionError) {
    return { error: permissionError.message };
  }

  // Revalidar la ruta para actualizar los datos
  revalidatePath(`/projects`);
  revalidatePath(`/dashboard?projectId=${projectId}`);

  return { success: "Usuario eliminado correctamente del proyecto" };
}
