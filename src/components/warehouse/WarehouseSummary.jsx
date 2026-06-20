import { motion } from 'framer-motion';

export default function WarehouseSummary({ items }) {
  const productsStored = items.length;
  const totalUnits = items.reduce((sum, item) => sum + (item.stock_count || 0), 0);
  const inventoryValue = items.reduce((sum, item) => sum + ((item.stock_count || 0) * (item.price || 0)), 0);
  const lowStock = items.filter(item => item.stock_count < 10 && item.stock_count > 0).length;
  const outOfStock = items.filter(item => item.stock_count === 0).length;

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(inventoryValue);

  const stats = [
    { label: "Products Stored", value: productsStored.toLocaleString() },
    { label: "Total Units", value: totalUnits.toLocaleString() },
    { label: "Inventory Value", value: formattedValue },
    { label: "Low Stock Items", value: lowStock },
    { label: "Out of Stock Items", value: outOfStock },
    { label: "Last Inventory Check", value: "Today" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] p-6"
    >
      <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight mb-6">
        Warehouse Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-xs text-[var(--text-tertiary)] font-medium mb-1">{stat.label}</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{stat.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
