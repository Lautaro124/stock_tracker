export interface StockItem {
  id: number;
  project_id: number;
  product_name: string;
  quantity: number;
  product_value: number;
  orders: number;
  min_quantity: number;
  notes?: string;
}
