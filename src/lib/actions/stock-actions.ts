"use server";
import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export async function getStockItems(projectId: number) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_item")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createStockItem({
  project_id,
  product_name,
  quantity,
  product_value,
  min_quantity,
  orders,
  notes,
}: {
  project_id: number;
  product_name: string;
  quantity: number;
  product_value: number;
  min_quantity: number;
  orders: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_item")
    .insert({
      project_id,
      product_name,
      quantity,
      product_value,
      min_quantity,
      orders,
      notes,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard?projectId=${project_id}`);
  return data;
}

export async function updateStockItem({
  id,
  project_id,
  product_name,
  quantity,
  product_value,
  min_quantity,
  orders,
  notes,
}: {
  id: number;
  project_id: number;
  product_name: string;
  quantity: number;
  product_value: number;
  min_quantity: number;
  orders: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("stock_item")
    .update({
      product_name,
      quantity,
      product_value,
      min_quantity,
      orders,
      notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard?projectId=${project_id}`);
  return data;
}
