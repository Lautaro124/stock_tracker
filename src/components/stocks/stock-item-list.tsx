"use client";

import { useState } from "react";
import CreateStockModal from "./create-stock-modal";
import EditStockModal from "./edit-stock-modal";
import QuickActionButtons from "./quick-action-buttons";
import { StockItem } from "@/interface/stock";

interface StockItemListProps {
  stocks: StockItem[];
  projectId: number;
}

export default function StockItemList({
  stocks,
  projectId,
}: StockItemListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);

  const sortedStocks = [...stocks].sort((a, b) =>
    a.product_name.localeCompare(b.product_name)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Inventario</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Añadir Item
        </button>
      </div>

      {sortedStocks.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            No hay items de inventario. Añade uno para comenzar.
          </p>
        </div>
      ) : (
        <>
          {/* Vista para móviles (tarjetas) */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {sortedStocks.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    {item.product_name}
                  </h4>
                  <button
                    onClick={() => setEditingStock(item)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Editar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Cantidad:
                  </div>
                  <div className="flex items-center justify-end">
                    <QuickActionButtons
                      stockItem={item}
                      field="quantity"
                      isMobile={true}
                    />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Stock Actual:
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm ${
                        item.quantity - item.orders <= item.min_quantity
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {(item.quantity - item.orders).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Valor:
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white text-right">
                    {item.product_value.toLocaleString()} €
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Mínimo:
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white text-right">
                    {item.min_quantity.toLocaleString()}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Ventas:
                  </div>
                  <div className="flex items-center justify-end">
                    <QuickActionButtons
                      stockItem={item}
                      field="orders"
                      isMobile={true}
                    />
                  </div>
                </div>

                {item.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Notas:
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {item.notes || "-"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Vista para tablets y escritorio (tabla) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Producto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Cantidad
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Stock Actual
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Valor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Mínimo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Ventas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Notas
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedStocks.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.product_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <QuickActionButtons stockItem={item} field="quantity" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          item.quantity - item.orders <= item.min_quantity
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {(item.quantity - item.orders).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.product_value.toLocaleString()} €
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.min_quantity.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        <QuickActionButtons stockItem={item} field="orders" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {item.notes || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingStock(item)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <CreateStockModal
          projectId={projectId}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {editingStock && (
        <EditStockModal
          stockItem={editingStock}
          onClose={() => setEditingStock(null)}
        />
      )}
    </div>
  );
}
