import { ArrowDownRight, ArrowUpRight, Package, Settings, Tag } from 'lucide-react';

/**
 * Standardizes raw database rows from `stock_movements` or `activity_log` into a unified UI model.
 * @param {Object} item - The raw database row. Must include a `_type` property ('stock' | 'activity').
 * @returns {Object} A standardized object with properties for rendering the event.
 */
export function formatActivityEvent(item) {
  const isStock = item._type === 'stock';
  const isInbound = isStock && item.quantity > 0;
  const isProductCreated = item.activity_type === 'product_created';
  
  let icon, bgClass, iconColor, title, description;
  
  if (isStock) {
    icon = isInbound ? ArrowDownRight : ArrowUpRight;
    bgClass = isInbound ? 'bg-[var(--success-subtle)]' : 'bg-[var(--text-primary)]';
    iconColor = isInbound ? 'text-[var(--success)]' : 'text-[var(--bg-card)]';
    title = isInbound ? 'Stock Added' : 'Stock Removed';
    description = isInbound ? `Added ${Math.abs(item.quantity)} units` : `Removed ${Math.abs(item.quantity)} units`;
  } else {
    icon = isProductCreated ? Package : item.activity_type === 'category_update' ? Tag : Settings;
    bgClass = isProductCreated ? 'bg-[var(--accent-subtle)]' : 'bg-[var(--bg-secondary)]';
    iconColor = isProductCreated ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]';
    title = isProductCreated ? 'Product Created' : 
            item.activity_type === 'price_update' ? 'Price Updated' :
            item.activity_type === 'name_update' ? 'Name Updated' :
            item.activity_type === 'category_update' ? 'Category Updated' : 'Setting Updated';
    description = item.description;
  }

  return {
    id: `${item._type}-${item.id}`,
    icon,
    bgClass,
    iconColor,
    title,
    description,
    productName: item.products?.name || item.productName || 'Unknown Item',
    rawDate: new Date(item.created_at),
    createdAt: item.created_at,
    originalItem: item
  };
}
