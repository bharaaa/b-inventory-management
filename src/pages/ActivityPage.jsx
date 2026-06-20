import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Calendar } from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { format } from "date-fns";
import { formatActivityEvent } from "../helpers/activityHelpers";
import { timeAgo } from "../helpers/timeAgo";
import ActivityDetailDrawer from "../components/activity/ActivityDetailDrawer";
import ProductDetailDrawer from "../components/inventory/ProductDetailDrawer";
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
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

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
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
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
                  className="absolute top-full right-0 mt-2 w-48 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-xl overflow-hidden py-1"
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
                          ? 'bg-white/40 text-[var(--text-primary)] font-medium' 
                          : 'text-[var(--text-secondary)] hover:bg-white/30 hover:text-[var(--text-primary)]'
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
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-tertiary)]"
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
        <div className="flex bg-[var(--bg-card)] backdrop-blur-xl rounded-xl border border-[var(--border)] p-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'log' ? 'bg-white/40 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'bg-white/40 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          >
            Activity Timeline
          </button>
        </div>
      </motion.div>

      <ActivityDetailDrawer
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
        onViewProduct={(productId) => {
          setSelectedActivity(null);
          setSelectedProductId(productId);
        }}
      />

      <ProductDetailDrawer
        isOpen={!!selectedProductId}
        onClose={() => setSelectedProductId(null)}
        productId={selectedProductId}
      />

      {activeTab === 'log' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="bg-[var(--bg-card)] backdrop-blur-xl rounded-2xl border border-[var(--border)] shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 z-10 bg-[var(--bg-card)] backdrop-blur-xl shadow-[0_1px_0_0_var(--border)]">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase font-medium text-[var(--text-tertiary)] tracking-wider">
                    Date & Time
                  </th>
                <th className="px-6 py-4 text-xs uppercase font-medium text-[var(--text-tertiary)] tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-4 text-xs uppercase font-medium text-[var(--text-tertiary)] tracking-wider">
                  Event
                </th>
                <th className="px-6 py-4 text-xs uppercase font-medium text-[var(--text-tertiary)] tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[var(--border)] bg-[var(--bg-card)]"
            >
              <AnimatePresence>
                {loading && activities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-[var(--text-tertiary)]"
                    >
                      No activities found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((movement) => {
                    const IconComp = movement.icon;

                    return (
                      <motion.tr
                        key={movement.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        layout
                        onClick={() => setSelectedActivity(movement)}
                        className="border-b border-[var(--border)] last:border-b-0 transition-colors duration-150 hover:bg-white/30 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                          {format(movement.rawDate, "MMM d, yyyy h:mm a")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-[var(--text-primary)]">
                            {movement.productName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${movement.bgClass} ${movement.iconColor}`}
                            >
                              <IconComp size={14} strokeWidth={3} />
                            </div>
                            <span className="text-sm font-medium text-[var(--text-primary)]">
                              {movement.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {movement.description}
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
        </motion.div>
      )}

      {activeTab === 'timeline' && (
        <div className="flex-1 min-h-0 flex flex-col">
          <CalendarTimeline 
            activities={filteredActivities} 
            dateFilter={dateFilter}
            onNodeClick={(act) => setSelectedActivity(act)}
          />
        </div>
      )}
    </div>
  );
}
