import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ProductService } from '../services/product.service';
import { StockService } from '../services/stock.service';
import { Product } from '../types/domain';
import { useToast } from '../contexts/ToastContext';

export function useInventory() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

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
      const targetItem = items.find(i => i.id === id);
      if (targetItem) {
        const newStock = Math.max(0, currentStock + delta);
        addToast(`Stock updated to ${newStock} for ${targetItem.name}`, 'success');
      }

      // Optimistic update
      setItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, stock_count: Math.max(0, currentStock + delta) } 
          : item
      ));
    } catch (error) {
      console.error('Error updating stock:', error);
      addToast('Failed to update stock', 'error');
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
