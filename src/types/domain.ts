export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_count: number;
  category_id?: number;
  created_at?: string;
  last_updated?: string;
  categories?: Category;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  type: string;
  notes?: string;
  created_at: string;
  products?: Product;
}

export interface ActivityLog {
  id: string;
  product_id: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  created_at: string;
  products?: Product;
}

export interface Snapshot {
  id: number;
  total_products: number;
  low_stock_alerts: number;
  total_value: number;
  warehouse_health: number;
  snapshot_date: string;
}
