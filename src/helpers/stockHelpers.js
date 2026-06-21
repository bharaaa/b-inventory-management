import { supabase } from '../services/supabaseClient';
import { subDays } from 'date-fns';

export async function getFastMovingProducts(days = 30, limit = 0) {
  const startDate = subDays(new Date(), days).toISOString();

  // Fetch all outbound movements in the timeframe
  const { data: movements, error } = await supabase
    .from('stock_movements')
    .select('*, products(name, category_id, stock_count, categories(name))')
    .lt('quantity', 0)
    .gte('created_at', startDate);

  if (error || !movements) {
    console.error('Error fetching stock movements:', error);
    return [];
  }

  // Aggregate by product_id
  const productMap = {};

  movements.forEach((movement) => {
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
    // quantity is negative, so we use absolute value or subtract
    productMap[pid].totalOutbound += Math.abs(movement.quantity);
    productMap[pid].movementCount += 1;
  });

  // Convert to array and sort by totalOutbound descending
  const sorted = Object.values(productMap).sort((a, b) => b.totalOutbound - a.totalOutbound);

  if (limit > 0) {
    return sorted.slice(0, limit);
  }

  return sorted;
}
