import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, AlertTriangle, DollarSign, Gauge } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import StockMovementChart from "../components/charts/StockMovementChart";
import CategoryChart from "../components/charts/CategoryChart";
import ValueDistributionChart from "../components/charts/ValueDistributionChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import InventoryTable from "../components/dashboard/InventoryTable";
import LowStockDrawer from "../components/dashboard/LowStockDrawer";
import TotalValueDrawer from "../components/dashboard/TotalValueDrawer";
import ProductDetailDrawer from "../components/inventory/ProductDetailDrawer";
import EditItemDrawer from "../components/inventory/EditItemDrawer";
import { formatActivityEvent } from "../helpers/activityHelpers";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockMovement, setStockMovement] = useState([]);
  const navigate = useNavigate();

  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [isTotalValueOpen, setIsTotalValueOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    async function fetchStockMovements() {
      // Get movements for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(price)")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true });
      if (error) {
        console.error(error);
        return;
      }
      // Initialize an array of the last 30 days with 0 inbound/outbound
      const dailyData = {};
      for (let i = 29; i >= 0; i--) {
        const dateStr = format(subDays(new Date(), i), "MMM d"); // e.g., "Jun 1"
        dailyData[dateStr] = { date: dateStr, inbound: 0, outbound: 0, salesValue: 0, ordersCount: 0 };
      }
      // Aggregate the fetched records into our daily buckets
      data.forEach((record) => {
        const dateStr = format(new Date(record.created_at), "MMM d");
        if (dailyData[dateStr]) {
          if (record.movement_type === "inbound") {
            dailyData[dateStr].inbound += record.quantity;
          } else if (record.movement_type === "outbound") {
            const qty = Math.abs(record.quantity);
            dailyData[dateStr].outbound += qty;
            dailyData[dateStr].ordersCount += 1;
            const price = record.products?.price || 0;
            dailyData[dateStr].salesValue += qty * price;
          }
        }
      });
      setStockMovement(Object.values(dailyData));
    }
    fetchStockMovements();
  }, []);

  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [snapshots, setSnapshots] = useState({ lastMonth: null });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setItems(data);
        
        // Group items by category
        const categoryMap = {};
        data.forEach((item) => {
          const cat = item.categories?.name || "Uncategorized";
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });

        // Convert to array and sort by highest count
        const sortedCategories = Object.keys(categoryMap)
          .map((key) => ({
            category: key,
            count: categoryMap[key],
          }))
          .sort((a, b) => b.count - a.count);

        setCategoryDistribution(sortedCategories);
      }
      setLoading(false);
    }

    async function fetchSnapshots() {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from('inventory_snapshots')
        .select('*')
        .lte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setSnapshots({ lastMonth: data[0] });
      }
    }

    async function fetchActivities() {
      const [stockRes, activityRes] = await Promise.all([
        supabase
          .from('stock_movements')
          .select('*, products(name)')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('activity_log')
          .select('*, products(name)')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const merged = [];
      if (stockRes.data) {
        merged.push(...stockRes.data.map(m => formatActivityEvent({
          ...m,
          _type: 'stock'
        })));
      }
      if (activityRes.data) {
        merged.push(...activityRes.data.map(a => formatActivityEvent({
          ...a,
          _type: 'activity'
        })));
      }

      merged.sort((a, b) => b.rawDate - a.rawDate);
      
      // Format timestamps for UI
      const formatted = merged.slice(0, 8).map(act => {
        const d = act.rawDate;
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let timeStr = format(d, "MMM d, h:mm a");
        if (diffMins < 60) timeStr = `${diffMins}m ago`;
        else if (diffHours < 24) timeStr = `${diffHours}h ago`;
        else if (diffDays === 1) timeStr = `Yesterday`;

        return {
          ...act,
          timestamp: timeStr
        };
      });

      setRecentActivities(formatted);
    }

    fetchItems();
    fetchSnapshots();
    fetchActivities();

    // Realtime subscriptions
    const productsSub = supabase
      .channel('custom-all-channel-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    const movementsSub = supabase
      .channel('custom-all-channel-movements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_movements' },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    const activitiesSub = supabase
      .channel('custom-all-channel-activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsSub);
      supabase.removeChannel(movementsSub);
      supabase.removeChannel(activitiesSub);
    };
  }, []);

  const totalProductsCount = items.length;
  const lowStockItems = items.filter(item => item.stock_count < 10);
  const lowStockCount = lowStockItems.length;
  const totalUsedCapacity = items.reduce((sum, item) => sum + (item.stock_count || 0), 0);
  const totalValue = items.reduce((sum, item) => sum + (item.stock_count * (item.price || 0)), 0);
  const formattedTotalValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(totalValue);
  
  const warehouseHealth = totalProductsCount === 0 ? 100 : Math.round(((totalProductsCount - lowStockCount) / totalProductsCount) * 100);

  const calculateChange = (current, past, inverse = false) => {
    if (past === null || past === undefined || past === 0) return null;
    const diff = current - past;
    const percentage = (diff / past) * 100;
    const value = parseFloat(percentage.toFixed(1));
    return value;
  };

  const calculateHealthChange = (current, past) => {
    if (past === null || past === undefined) return null;
    return parseFloat((current - past).toFixed(1));
  };

  const metrics = [
    {
      title: "Total Products",
      value: loading ? "..." : totalProductsCount.toLocaleString(),
      change: calculateChange(totalProductsCount, snapshots.lastMonth?.total_products),
      changeLabel: "vs last month",
      icon: <Package size={20} strokeWidth={1.5} />,
      onClick: () => navigate("/inventory"),
    },
    {
      title: "Low Stock Alerts",
      value: loading ? "..." : lowStockCount.toString(),
      change: calculateChange(lowStockCount, snapshots.lastMonth?.low_stock_alerts),
      changeLabel: "vs last month",
      inverseGood: true, // For low stock, a negative change is good
      icon: <AlertTriangle size={20} strokeWidth={1.5} />,
      onClick: () => setIsLowStockOpen(true)
    },
    {
      title: "Total Value",
      value: loading ? "..." : formattedTotalValue,
      change: calculateChange(totalValue, snapshots.lastMonth?.total_value),
      changeLabel: "vs last month",
      icon: <DollarSign size={20} strokeWidth={1.5} />,
      onClick: () => setIsTotalValueOpen(true)
    },
    {
      title: "Warehouse Health",
      value: loading ? "..." : `${warehouseHealth}%`,
      change: calculateHealthChange(warehouseHealth, snapshots.lastMonth?.warehouse_health),
      changeLabel: "vs last month",
      icon: <Gauge size={20} strokeWidth={1.5} />,
      onClick: () => navigate('/warehouse')
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-bold text-[var(--text-primary)] tracking-tight"
        >
          {(() => {
            const hour = new Date().getHours();
            if (hour < 12) return "Good Morning";
            if (hour < 18) return "Good Afternoon";
            return "Good Evening";
          })()}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          Here's what's happening with your inventory today
        </motion.p>
      </div>

      {/* Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {/* Row 1: Metric Cards */}
        {metrics.map((metric, index) => (
          <motion.div key={metric.title} variants={itemVariants}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeLabel={metric.changeLabel}
              icon={metric.icon}
              onClick={metric.onClick}
              index={index}
            />
          </motion.div>
        ))}

        {/* Main Content Area (Left: 3 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-5">
          <StockMovementChart data={stockMovement} />
          <InventoryTable items={items} loading={loading} />
        </motion.div>

        {/* Sidebar Area (Right: 1 column) */}
        <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-5">
          <ValueDistributionChart items={items} />
          <CategoryChart data={categoryDistribution} />
          <ActivityTimeline activities={recentActivities} />
        </motion.div>
      </motion.div>

      <LowStockDrawer
        isOpen={isLowStockOpen}
        onClose={() => setIsLowStockOpen(false)}
        lowStockItems={lowStockItems}
        onViewItem={(item) => {
          setIsLowStockOpen(false);
          setViewingItem(item);
        }}
      />

      <TotalValueDrawer
        isOpen={isTotalValueOpen}
        onClose={() => setIsTotalValueOpen(false)}
        items={items}
      />

      <ProductDetailDrawer
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
        onEdit={(item) => setEditingItem(item)}
        onItemUpdated={(updatedItem) => {
          setViewingItem(updatedItem);
        }}
      />

      <EditItemDrawer
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        totalUsedCapacity={totalUsedCapacity}
        onSuccess={() => {
          setEditingItem(null);
          // Real-time subscriptions will automatically fetch updated data
        }}
      />
    </div>
  );
}
