import { supabase } from './supabaseClient';
import { Product } from '../types/domain';

export const ProductService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
    return data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    return data;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select('*, categories(name)')
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name)')
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async bulkDeleteProducts(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }
};
