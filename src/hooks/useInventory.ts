import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ProductService } from '../services/product.service';
import { StockService } from '../services/stock.service';
import { Product } from '../types/domain';

export function useInventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllProducts();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const updateStock = async (id: string, currentStock: number, delta: number) => {
    try {
      await StockService.updateStock(id, currentStock, delta);
      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, stock_count: Math.max(0, currentStock + delta) } 
          : item
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
      // Revert optimism by re-fetching
      fetchItems();
    }
  };

  const deleteItems = async (ids: string[]) => {
    try {
      await ProductService.bulkDeleteProducts(ids);
      setItems(prev => prev.filter(item => !ids.includes(item.id)));
    } catch (error) {
      console.error('Error deleting items:', error);
      fetchItems();
    }
  };

  return {
    items,
    loading,
    fetchItems,
    updateStock,
    deleteItems
  };
}
