import { supabase } from './supabaseClient';
import { Snapshot } from '../types/domain';
import { subDays } from 'date-fns';

export const SnapshotService = {
  async getLastMonthSnapshot(): Promise<Snapshot | null> {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const { data, error } = await supabase
      .from('inventory_snapshots')
      .select('*')
      .lte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching snapshot:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  }
};
