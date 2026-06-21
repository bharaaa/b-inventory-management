import { motion } from "framer-motion";
import { Package, AlertTriangle, DollarSign, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/ui/MetricCard";
import StockMovementChart from "../components/charts/StockMovementChart";
import CategoryChart from "../components/charts/CategoryChart";
import ValueDistributionChart from "../components/charts/ValueDistributionChart";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import InventoryTable from "../components/dashboard/InventoryTable";
import FastMovingProducts from "../components/dashboard/FastMovingProducts";
import { useDrawer } from "../contexts/DrawerContext";
import { useDashboardStats } from "../hooks/useDashboardStats";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const {
    items,
    loading,
    stockMovement,
    categoryDistribution,
    snapshots,
    recentActivities,
    fastMovingProducts
  } = useDashboardStats();

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

  const calculateChange = (current: number, past: number | undefined) => {
    if (past === null || past === undefined || past === 0) return null;
    const diff = current - past;
    const percentage = (diff / past) * 100;
    return parseFloat(percentage.toFixed(1));
  };

  const calculateHealthChange = (current: number, past: number | undefined) => {
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
      inverseGood: true, 
      icon: <AlertTriangle size={20} strokeWidth={1.5} />,
      onClick: () => openDrawer('LOW_STOCK', { lowStockItems, onViewItem: (item: any) => openDrawer('PRODUCT_DETAIL', { item, onEdit: (i: any) => openDrawer('EDIT_ITEM', { item: i, totalUsedCapacity }) }) })
    },
    {
      title: "Total Value",
      value: loading ? "..." : formattedTotalValue,
      change: calculateChange(totalValue, snapshots.lastMonth?.total_value),
      changeLabel: "vs last month",
      icon: <DollarSign size={20} strokeWidth={1.5} />,
      onClick: () => openDrawer('TOTAL_VALUE', { items })
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
        className="flex flex-col gap-5"
      >
        {/* Row 1: Primary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
                inverseGood={metric.inverseGood}
              />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main Content Area (Left: 3 columns) */}
          <motion.div variants={itemVariants} className="lg:col-span-3 flex flex-col gap-5">
            <StockMovementChart data={stockMovement} />
            <InventoryTable items={items} loading={loading} />
          </motion.div>

          {/* Sidebar Area (Right: 1 column) */}
          <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-5">
            <ValueDistributionChart items={items} />
            <CategoryChart data={categoryDistribution} />
            <FastMovingProducts items={fastMovingProducts} />
            <ActivityTimeline activities={recentActivities} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
