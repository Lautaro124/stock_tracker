"use client";

import { useState } from "react";
import { StockItem } from "@/interface/stock";
import { quickUpdateStockItem } from "@/lib/actions/stock-actions";

interface QuickActionButtonsProps {
  stockItem: StockItem;
  field: "quantity" | "orders";
}

const QuickActionButtons = ({ stockItem, field }: QuickActionButtonsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (value: number) => {
    setIsUpdating(true);
    try {
      await quickUpdateStockItem({
        id: stockItem.id,
        project_id: stockItem.project_id,
        field,
        value,
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex space-x-1 items-center justify-center">
      <button
        onClick={() => handleUpdate(-1)}
        disabled={
          isUpdating ||
          (field === "quantity" && stockItem.quantity <= 0) ||
          (field === "orders" && stockItem.orders <= 0)
        }
        className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        title={field === "quantity" ? "Reducir stock" : "Reducir pedidos"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-gray-700 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>
      <button
        onClick={() => handleUpdate(1)}
        disabled={isUpdating}
        className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        title={field === "quantity" ? "Aumentar stock" : "Aumentar pedidos"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5 text-blue-700 dark:text-blue-300"
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
      </button>
    </div>
  );
};

export default QuickActionButtons;
