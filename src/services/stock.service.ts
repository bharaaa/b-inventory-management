import { supabase } from './supabaseClient';
import { subDays } from 'date-fns';
import { Product } from '../types/domain';

export interface FastMovingProduct {
  product_id: string;
  name: string;
  category: string;
  currentStock: number;
  totalOutbound: number;
  movementCount: number;
}

export interface DeadStockProduct {
  product_id: string;
  name: string;
  category: string;
  currentStock: number;
  price: number;
  valueLocked: number;
}

export interface DemandTrendProduct extends FastMovingProduct {
  dailyVelocity: number;
  daysUntilStockOut: number;
  riskStatus: 'healthy' | 'warning' | 'critical' | 'stocked_out';
}

export const StockService = {
  async getFastMovingProducts(days: number = 30, limit: number = 0): Promise<FastMovingProduct[]> {
    const startDate = subDays(new Date(), days).toISOString();

    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('*, products(name, category_id, stock_count, categories(name))')
      .lt('quantity', 0)
      .gte('created_at', startDate);

    if (error || !movements) {
      console.error('Error fetching stock movements:', error);
      return [];
    }

    const productMap: Record<string, FastMovingProduct> = {};

    movements.forEach((movement: any) => {
      const pid = movement.product_id;
      if (!productMap[pid]) {
        productMap[pid] = {
          product_id: pid,
          name: movement.products?.name || 'Unknown Product',
          category: movement.products?.categories?.name || 'Uncategorized',
          currentStock: movement.products?.stock_count || 0,
          totalOutbound: 0,
          movementCount: 0,
        };
      }
      productMap[pid].totalOutbound += Math.abs(movement.quantity);
      productMap[pid].movementCount += 1;
    });

    const sorted = Object.values(productMap).sort((a, b) => b.totalOutbound - a.totalOutbound);

    if (limit > 0) {
      return sorted.slice(0, limit);
    }

    return sorted;
  },

  async getDeadStockProducts(allItems: Product[], days: number = 90): Promise<DeadStockProduct[]> {
    const startDate = subDays(new Date(), days).toISOString();

    const { data: movements, error } = await supabase
      .from('stock_movements')
      .select('product_id')
      .lt('quantity', 0)
      .gte('created_at', startDate);

    if (error || !movements) {
      console.error('Error fetching stock movements for dead stock:', error);
      return [];
    }

    const movedProductIds = new Set(movements.map((m: any) => m.product_id));
    const deadStock: DeadStockProduct[] = [];
    
    allItems.forEach(item => {
      if (item.stock_count > 0 && !movedProductIds.has(item.id)) {
        const price = item.price || 0;
        deadStock.push({
          product_id: item.id,
          name: item.name || 'Unknown Product',
          category: item.categories?.name || 'Uncategorized',
          currentStock: item.stock_count,
          price: price,
          valueLocked: item.stock_count * price
        });
      }
    });

    return deadStock.sort((a, b) => b.valueLocked - a.valueLocked);
  },

  async getDemandTrendProducts(days: number = 30): Promise<DemandTrendProduct[]> {
    const fastMoving = await this.getFastMovingProducts(days, 0);
    
    const trends: DemandTrendProduct[] = fastMoving.map(item => {
      const safeDays = days > 0 ? days : 1;
      const dailyVelocity = item.totalOutbound / safeDays;
      
      let daysUntilStockOut = Infinity;
      let riskStatus: 'healthy' | 'warning' | 'critical' | 'stocked_out' = 'healthy';
      
      if (dailyVelocity > 0) {
        daysUntilStockOut = Math.ceil(item.currentStock / dailyVelocity);
      }
      
      if (item.currentStock === 0) {
        daysUntilStockOut = 0;
        riskStatus = 'stocked_out';
      } else if (daysUntilStockOut <= 7) {
        riskStatus = 'critical';
      } else if (daysUntilStockOut <= 30) {
        riskStatus = 'warning';
      }
      
      return {
        ...item,
        dailyVelocity: parseFloat(dailyVelocity.toFixed(2)),
        daysUntilStockOut,
        riskStatus
      };
    });
    
    const riskOrder = { 'stocked_out': 1, 'critical': 2, 'warning': 3, 'healthy': 4 };
    
    return trends.sort((a, b) => {
      if (riskOrder[a.riskStatus] !== riskOrder[b.riskStatus]) {
        return riskOrder[a.riskStatus] - riskOrder[b.riskStatus];
      }
      return a.daysUntilStockOut - b.daysUntilStockOut;
    });
  },

  async updateStock(productId: string, currentStock: number, delta: number): Promise<void> {
    const newStock = Math.max(0, currentStock + delta);
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_count: newStock, last_updated: new Date().toISOString() })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating stock count:', updateError);
      throw updateError;
    }

    const { error: moveError } = await supabase
      .from('stock_movements')
      .insert([{
        product_id: productId,
        quantity: delta,
        movement_type: delta > 0 ? 'inbound' : 'outbound'
      }]);

    if (moveError) {
      console.error('Error logging stock movement:', moveError);
      throw moveError;
    }
  },

  async getDailyStockMovements(days: number = 30) {
    const startDate = subDays(new Date(), days);
    
    const { data, error } = await supabase
      .from("stock_movements")
      .select("*, products(price)")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });
      
    if (error) {
      console.error('Error fetching daily stock movements:', error);
      throw error;
    }

    return data || [];
  }
};
