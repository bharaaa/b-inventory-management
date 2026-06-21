import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { format } from "date-fns";
import { formatActivityEvent } from "../helpers/activityHelpers";
import { timeAgo } from "../helpers/timeAgo";
import { useDrawer } from "../contexts/DrawerContext";
import DataTable from "../components/ui/DataTable";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import CalendarTimeline from "../components/activity/CalendarTimeline";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("log");
  const { openDrawer } = useDrawer();

  const fetchActivities = async () => {
    setLoading(true);
    const [stockRes, activityRes] = await Promise.all([
      supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("activity_log")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const merged = [];
    if (stockRes.data) {
      merged.push(
        ...stockRes.data.map((m) =>
          formatActivityEvent({
            ...m,
            _type: "stock",
            productName: m.products?.name || "Unknown Item",
          }),
        ),
      );
    }
    if (activityRes.data) {
      merged.push(
        ...activityRes.data.map((a) =>
          formatActivityEvent({
            ...a,
            _type: "activity",
            productName: a.products?.name || "Unknown Item",
          }),
        ),
      );
    }

    merged.sort((a, b) => b.rawDate - a.rawDate);
    
    // Format timestamp for Timeline view
    const formatted = merged.map(act => ({
      ...act,
      timestamp: timeAgo(act.rawDate)
    }));

    setActivities(formatted);
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    const stockSub = supabase
      .channel("activity-page-stock")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_movements" },
        () => {
          fetchActivities();
        },
      )
      .subscribe();

    const activitySub = supabase
      .channel("activity-page-activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => {
          fetchActivities();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stockSub);
      supabase.removeChannel(activitySub);
    };
  }, []);

  const filteredActivities = useMemo(() => {
    let result = activities;

    // Apply Date Filter
    if (dateFilter !== "all") {
      const now = new Date();
      const todayStr = now.toDateString();
      result = result.filter(a => {
        const diffDays = (now - a.rawDate) / (1000 * 60 * 60 * 24);
        if (dateFilter === "today") return a.rawDate.toDateString() === todayStr;
        if (dateFilter === "7days") return diffDays <= 7;
        if (dateFilter === "30days") return diffDays <= 30;
        return true;
      });
    }

    // Apply Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter((a) => {
        return (
          a.productName.toLowerCase().includes(lower) ||
          a.title.toLowerCase().includes(lower) ||
          a.description.toLowerCase().includes(lower)
        );
      });
    }

    return result;
  }, [activities, searchTerm, dateFilter]);

  const filterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" }
  ];

  const columns = [
    {
      key: "date",
      header: "Date & Time",
      render: (movement) => <span className="text-[var(--text-secondary)]">{format(movement.rawDate, "MMM d, yyyy h:mm a")}</span>
    },
    {
      key: "productName",
      header: "Product Name",
      render: (movement) => <span className="font-medium text-[var(--text-primary)]">{movement.productName}</span>
    },
    {
      key: "event",
      header: "Event",
      render: (movement) => {
        const IconComp = movement.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${movement.bgClass} ${movement.iconColor}`}>
              <IconComp size={16} strokeWidth={3} className={movement.iconColor} />
            </div>
            <span className="font-medium text-[var(--text-primary)]">{movement.title}</span>
          </div>
        );
      }
    },
    {
      key: "description",
      header: "Description",
      render: (movement) => <span className="text-[var(--text-secondary)]">{movement.description}</span>
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-0 pb-2">
      {/* Click-outside overlay for dropdown */}
      {isDateDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsDateDropdownOpen(false)}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
          >
            Activity
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="text-sm text-[var(--text-tertiary)] mt-1"
          >
            Complete history of all inventory operations
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="flex items-center gap-3 w-full sm:w-auto"
        >
          {/* Date Filter Custom Dropdown */}
          <div className="relative z-50">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] hover:bg-white/80 dark:hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 shadow-sm"
            >
              <Calendar size={16} className="text-[var(--text-tertiary)]" />
              {filterOptions.find(o => o.value === dateFilter)?.label}
              <ChevronDown 
                size={16} 
                className={`text-[var(--text-tertiary)] transition-transform duration-200 ${isDateDropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isDateDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-md border border-[var(--border)] rounded-xl shadow-xl overflow-hidden py-1"
                >
                  {filterOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDateFilter(option.value);
                        setIsDateDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        dateFilter === option.value 
                          ? 'bg-black/[0.04] dark:bg-white/[0.08] text-[var(--text-primary)] font-medium' 
                          : 'text-[var(--text-secondary)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] hover:bg-white/80 dark:hover:bg-black/60 transition-all placeholder:text-[var(--text-tertiary)] shadow-sm"
            />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
        className="flex items-center gap-2 mb-6"
      >
        <div className="flex bg-white/40 dark:bg-black/40 backdrop-blur-md rounded-xl border border-[var(--border)] p-1 w-full sm:w-auto overflow-x-auto shadow-sm">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'log' ? 'bg-white dark:bg-[#2A2A2A] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/50 dark:hover:bg-white/10'}`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'bg-white dark:bg-[#2A2A2A] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/50 dark:hover:bg-white/10'}`}
          >
            Activity Timeline
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'log' && (
          <DataTable
            key="log"
            columns={columns}
            data={filteredActivities}
            loading={loading}
            emptyIcon={Search}
            emptyMessage={
              <div className="mt-3">
                <p className="font-medium text-[var(--text-secondary)]">No results found</p>
                <p className="text-sm mt-1 text-[var(--text-tertiary)]">Try adjusting your search or date filter.</p>
              </div>
            }
            onRowClick={(movement) => openDrawer('ACTIVITY_DETAIL', { 
              activity: movement, 
              onViewProduct: (productId) => openDrawer('PRODUCT_DETAIL', { productId }) 
            })}
          />
        )}

        {activeTab === 'timeline' && (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-0 flex flex-col"
          >
          <CalendarTimeline 
            activities={filteredActivities} 
            dateFilter={dateFilter}
            onNodeClick={(act) => openDrawer('ACTIVITY_DETAIL', { activity: act, onViewProduct: (productId) => openDrawer('PRODUCT_DETAIL', { productId }) })}
          />
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
