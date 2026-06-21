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

export async function getDeadStockProducts(allItems, days = 90) {
  const startDate = subDays(new Date(), days).toISOString();

  // Fetch outbound movements in timeframe to see what DID move
  const { data: movements, error } = await supabase
    .from('stock_movements')
    .select('product_id')
    .lt('quantity', 0)
    .gte('created_at', startDate);

  if (error || !movements) {
    console.error('Error fetching stock movements for dead stock:', error);
    return [];
  }

  // Create set of product IDs that have moved
  const movedProductIds = new Set(movements.map(m => m.product_id));

  // Find products that have stock > 0 but have NOT moved
  const deadStock = [];
  
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

  // Sort by highest value locked
  return deadStock.sort((a, b) => b.valueLocked - a.valueLocked);
}

export async function getDemandTrendProducts(days = 30) {
  // First, get the fast moving products to know their outbound volume
  const fastMoving = await getFastMovingProducts(days, 0);
  
  const trends = fastMoving.map(item => {
    // Prevent division by zero
    const safeDays = days > 0 ? days : 1;
    const dailyVelocity = item.totalOutbound / safeDays;
    
    let daysUntilStockOut = Infinity;
    let riskStatus = 'healthy';
    
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
  
  // Sort by highest risk first (Stocked Out -> Critical -> Warning -> Healthy)
  // And within same risk level, sort by days until stock out ascending
  const riskOrder = { 'stocked_out': 1, 'critical': 2, 'warning': 3, 'healthy': 4 };
  
  return trends.sort((a, b) => {
    if (riskOrder[a.riskStatus] !== riskOrder[b.riskStatus]) {
      return riskOrder[a.riskStatus] - riskOrder[b.riskStatus];
    }
    return a.daysUntilStockOut - b.daysUntilStockOut;
  });
}
