import { supabase } from './supabaseClient';
import { ActivityLog } from '../types/domain';

export const ActivityService = {
  async logActivity(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from('activity_log')
      .insert([log]);

    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  },

  async bulkLogActivities(logs: Omit<ActivityLog, 'id' | 'created_at'>[]): Promise<void> {
    const { error } = await supabase
      .from('activity_log')
      .insert(logs);

    if (error) {
      console.error('Error logging bulk activities:', error);
      throw error;
    }
  },

  async getRecentActivities(limit: number = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_log')
      .select('*, products(name, category_id, stock_count, categories(name))')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    return data || [];
  },

  async getDashboardActivities(limit: number = 10) {
    const [stockRes, activityRes] = await Promise.all([
      supabase
        .from('stock_movements')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(limit),
      supabase
        .from('activity_log')
        .select('*, products(name)')
        .order('created_at', { ascending: false })
        .limit(limit)
    ]);

    return {
      stockMovements: stockRes.data || [],
      activityLogs: activityRes.data || []
    };
  }
};
