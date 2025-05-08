"use client";

import { useState, useTransition } from "react";
import { createStockItem } from "@/lib/actions/stock-actions";

interface CreateStockModalProps {
  projectId: number;
  onClose: () => void;
}

export default function CreateStockModal({
  projectId,
  onClose,
}: CreateStockModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const product_name = formData.get("product_name") as string;
    const quantity = parseFloat(formData.get("quantity") as string);
    const product_value = parseFloat(formData.get("product_value") as string);
    const min_quantity = parseFloat(formData.get("min_quantity") as string);
    const orders = parseFloat(formData.get("orders") as string);
    const notes = formData.get("notes") as string;

    if (!product_name) {
      setFormError(
        "Por favor, complete todos los campos requeridos correctamente"
      );
      return;
    }

    if (quantity && isNaN(quantity)) {
      setFormError("La cantidad debe ser un número válido");
      return;
    }
    if (product_value && isNaN(product_value)) {
      setFormError("El valor del producto debe ser un número válido");
      return;
    }

    startTransition(async () => {
      try {
        await createStockItem({
          project_id: projectId,
          product_name,
          quantity,
          product_value,
          min_quantity: isNaN(min_quantity) ? 0 : min_quantity,
          orders: isNaN(orders) ? 0 : orders,
          notes: notes || undefined,
        });
        onClose();
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error al crear el stock"
        );
      }
    });
  }

  return (
    <>
      <div className="absolute inset-0 bg-black opacity-50 z-40" />
      <div className="fixed inset-0 flex  items-center justify-center z-50 p-4 h-screen">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Crear nuevo item de stock</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="product_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre del producto*
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cantidad*
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product_value"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Valor del producto
                </label>
                <input
                  type="number"
                  id="product_value"
                  name="product_value"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min_quantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cantidad mínima
                </label>
                <input
                  type="number"
                  id="min_quantity"
                  name="min_quantity"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="orders"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pedidos
                </label>
                <input
                  type="number"
                  id="orders"
                  name="orders"
                  min="0"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Notas
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creando...
                  </span>
                ) : (
                  "Crear"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
