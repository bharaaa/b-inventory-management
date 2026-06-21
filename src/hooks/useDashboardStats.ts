import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { ProductService } from '../services/product.service';
import { StockService } from '../services/stock.service';
import { SnapshotService } from '../services/snapshot.service';
import { ActivityService } from '../services/activity.service';
import { format, subDays } from 'date-fns';
import { formatActivityEvent } from '../helpers/activityHelpers';

export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [stockMovement, setStockMovement] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any>({ lastMonth: null });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [fastMovingProducts, setFastMovingProducts] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Items
      const data = await ProductService.getAllProducts();
      setItems(data);
      
      const categoryMap: Record<string, number> = {};
      data.forEach((item) => {
        const cat = item.categories?.name || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      });

      const sortedCategories = Object.keys(categoryMap)
        .map((key) => ({ category: key, count: categoryMap[key] }))
        .sort((a, b) => b.count - a.count);
      setCategoryDistribution(sortedCategories);

      // 2. Fetch Snapshots
      const snapshot = await SnapshotService.getLastMonthSnapshot();
      if (snapshot) setSnapshots({ lastMonth: snapshot });

      // 3. Fetch Stock Movements (Daily Chart)
      const movementsData = await StockService.getDailyStockMovements(30);
      const dailyData: Record<string, any> = {};
      for (let i = 29; i >= 0; i--) {
        const dateStr = format(subDays(new Date(), i), "MMM d");
        dailyData[dateStr] = { date: dateStr, inbound: 0, outbound: 0, salesValue: 0, ordersCount: 0 };
      }

      movementsData.forEach((record: any) => {
        const dateStr = format(new Date(record.created_at), "MMM d");
        if (dailyData[dateStr]) {
          if (record.quantity > 0) {
            dailyData[dateStr].inbound += record.quantity;
          } else if (record.quantity < 0) {
            const qty = Math.abs(record.quantity);
            dailyData[dateStr].outbound += qty;
            dailyData[dateStr].ordersCount += 1;
            const price = record.products?.price || 0;
            dailyData[dateStr].salesValue += qty * price;
          }
        }
      });
      setStockMovement(Object.values(dailyData));

      // 4. Fetch Activities
      const { stockMovements, activityLogs } = await ActivityService.getDashboardActivities(10);
      const merged = [];
      if (stockMovements) {
        merged.push(...stockMovements.map((m: any) => formatActivityEvent({ ...m, _type: 'stock' })));
      }
      if (activityLogs) {
        merged.push(...activityLogs.map((a: any) => formatActivityEvent({ ...a, _type: 'activity' })));
      }

      merged.sort((a, b) => b.rawDate - a.rawDate);
      
      const formatted = merged.slice(0, 8).map(act => {
        const d = act.rawDate;
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = format(d, "MMM d, h:mm a");
        if (diffMins < 60) timeStr = `${diffMins}m ago`;
        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
        else if (diffDays === 1) timeStr = `Yesterday`;

        return { ...act, timestamp: timeStr };
      });
      setRecentActivities(formatted);

      // 5. Fast Moving
      const fastMoving = await StockService.getFastMovingProducts(30, 5);
      setFastMovingProducts(fastMoving);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const productsSub = supabase.channel('custom-all-channel-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchDashboardData).subscribe();

    const movementsSub = supabase.channel('custom-all-channel-movements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, fetchDashboardData).subscribe();

    const activitiesSub = supabase.channel('custom-all-channel-activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, fetchDashboardData).subscribe();

    return () => {
      supabase.removeChannel(productsSub);
      supabase.removeChannel(movementsSub);
      supabase.removeChannel(activitiesSub);
    };
  }, [fetchDashboardData]);

  return {
    items,
    loading,
    stockMovement,
    categoryDistribution,
    snapshots,
    recentActivities,
    fastMovingProducts,
    refetch: fetchDashboardData
  };
}
