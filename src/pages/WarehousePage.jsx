import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../services/supabaseClient";
import { Box, CheckCircle2, Server, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";

import MetricCard from "../components/ui/MetricCard";
import CapacityVisualization from "../components/warehouse/CapacityVisualization";
import InventoryDistribution from "../components/warehouse/InventoryDistribution";
import StorageZones from "../components/warehouse/StorageZones";
import WarehouseAlerts from "../components/warehouse/WarehouseAlerts";
import TopStoredProducts from "../components/warehouse/TopStoredProducts";
import WarehouseSummary from "../components/warehouse/WarehouseSummary";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import LowStockDrawer from "../components/dashboard/LowStockDrawer";
import ProductDetailDrawer from "../components/inventory/ProductDetailDrawer";
import { formatActivityEvent } from "../helpers/activityHelpers";
import { TOTAL_WAREHOUSE_CAPACITY } from "../config/constants";

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
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function WarehousePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isLowStockOpen, setIsLowStockOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const productsSub = supabase
      .channel('warehouse-products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const movementsSub = supabase
      .channel('warehouse-movements-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stock_movements' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    const activitiesSub = supabase
      .channel('warehouse-activities-channel')
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

  async function fetchData() {
    setLoading(true);
    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order('name');
      
    if (!productsError && productsData) {
      setItems(productsData);
    }

    await fetchActivities();
    setLoading(false);
  }

  async function fetchActivities() {
    // Fetch recent activities
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
    if (!stockRes.error && stockRes.data) {
      merged.push(...stockRes.data.map(m => formatActivityEvent({ ...m, _type: 'stock' })));
    }
    if (!activityRes.error && activityRes.data) {
      merged.push(...activityRes.data.map(a => formatActivityEvent({ ...a, _type: 'activity' })));
    }

    merged.sort((a, b) => b.rawDate - a.rawDate);
    setRecentActivities(merged.slice(0, 10));
  }

  // Calculations
  const totalProductsCount = items.length;
  const usedCapacity = items.reduce((sum, item) => sum + (item.stock_count || 0), 0);
  const availableCapacity = TOTAL_WAREHOUSE_CAPACITY - usedCapacity;
  const lowStockItems = items.filter(item => item.stock_count < 10);
  
  const warehouseHealth = totalProductsCount === 0 
    ? 100 
    : Math.round(((totalProductsCount - lowStockItems.length) / totalProductsCount) * 100);

  const metrics = [
    {
      title: "Total Capacity",
      value: loading ? "..." : `${TOTAL_WAREHOUSE_CAPACITY.toLocaleString()}`,
      change: null,
      changeLabel: "Units",
      icon: <Server size={20} strokeWidth={1.5} />,
    },
    {
      title: "Used Capacity",
      value: loading ? "..." : `${usedCapacity.toLocaleString()}`,
      change: null,
      changeLabel: "Units",
      icon: <Box size={20} strokeWidth={1.5} />,
    },
    {
      title: "Available Capacity",
      value: loading ? "..." : `${availableCapacity.toLocaleString()}`,
      change: null,
      changeLabel: "Units",
      icon: <CheckCircle2 size={20} strokeWidth={1.5} />,
    },
    {
      title: "Warehouse Health",
      value: loading ? "..." : `${warehouseHealth}%`,
      change: warehouseHealth > 90 ? 2.5 : (warehouseHealth < 70 ? -5.2 : 0),
      changeLabel: "operational",
      icon: <Gauge size={20} strokeWidth={1.5} />,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
        >
          Warehouse Command Center
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          Monitor utilization, inventory distribution, and operational health.
        </motion.p>
      </div>

      {/* KPI Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {metrics.map((metric, index) => (
          <motion.div key={metric.title} variants={itemVariants}>
            <MetricCard
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeLabel={metric.changeLabel}
              icon={metric.icon}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 mt-5">
        
        {/* Left Section (70% -> col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <CapacityVisualization 
            usedCapacity={usedCapacity} 
            totalCapacity={TOTAL_WAREHOUSE_CAPACITY} 
            itemCount={totalProductsCount} 
          />
          <InventoryDistribution items={items} totalStock={usedCapacity} />
          
          {/* Reuse Activity Timeline but give it a specific wrapper to match design */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-5"
          >
            <ActivityTimeline activities={recentActivities} title="Recent Warehouse Activity" />
          </motion.div>
        </div>

        {/* Right Section (30% -> col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          <StorageZones items={items} />
          <WarehouseAlerts 
            items={items} 
            onOpenLowStock={() => setIsLowStockOpen(true)} 
          />
          <TopStoredProducts items={items} totalCapacity={TOTAL_WAREHOUSE_CAPACITY} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-5">
        <WarehouseSummary items={items} />
      </div>

      {/* Drawers */}
      <LowStockDrawer
        isOpen={isLowStockOpen}
        onClose={() => setIsLowStockOpen(false)}
        lowStockItems={lowStockItems}
        onViewItem={(item) => {
          setIsLowStockOpen(false);
          setViewingItem(item);
        }}
      />

      <ProductDetailDrawer
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        item={viewingItem}
        onItemUpdated={(updatedItem) => {
          setViewingItem(updatedItem);
        }}
      />
    </div>
  );
}
