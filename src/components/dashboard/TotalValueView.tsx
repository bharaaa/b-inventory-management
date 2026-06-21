import { motion } from "framer-motion";
import { X, DollarSign, Package } from "lucide-react";
import DrawerHeader from "../ui/DrawerHeader";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function TotalValueView({ isOpen, onClose, items }) {
  // Calculate values
  const grandTotal = items.reduce(
    (sum, item) => sum + item.stock_count * (item.price || 0),
    0,
  );

  // Sort items by total value descending
  const sortedItems = [...items].sort((a, b) => {
    const valueA = a.stock_count * (a.price || 0);
    const valueB = b.stock_count * (b.price || 0);
    return valueB - valueA;
  });

  const formattedGrandTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(grandTotal);

  return (
    <>
      <DrawerHeader title="Total Inventory Value" onClose={onClose} />

      {/* Grand Total Summary */}
      <div className="p-6 border-b border-[var(--border)] bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-sm z-0">
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-[var(--border)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Grand Total
            </p>
            <p className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight drop-shadow-sm">
              {formattedGrandTotal}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--success)]/20 to-[var(--success)]/5 border border-[var(--success)]/30 flex items-center justify-center text-[var(--success)] shadow-[inset_0_2px_10px_rgba(255,255,255,0.9)]">
            <DollarSign size={28} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-white/70 dark:bg-black/70 backdrop-blur-sm">
        <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          Value by Item{" "}
          <span className="w-full h-px bg-[var(--border)] flex-1 block"></span>
        </h3>

        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-sm border border-[var(--border)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
              <Package size={28} />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No items found
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3 pb-8"
          >
            {sortedItems.map((item) => {
              const price = item.price || 0;
              const stock = item.stock_count || 0;
              const totalItemValue = price * stock;
              const percentage =
                grandTotal > 0
                  ? ((totalItemValue / grandTotal) * 100).toFixed(1)
                  : 0;

              const formattedPrice = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(price);

              const formattedTotal = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              }).format(totalItemValue);

              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-[var(--border)] rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/80 dark:hover:bg-black/60 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-11 h-11 rounded-xl object-cover bg-black/[0.02] border border-[var(--border)] shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-[var(--border)] shadow-sm flex items-center justify-center shrink-0">
                          <Package
                            size={18}
                            className="text-[var(--text-tertiary)]"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--success)] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs font-medium text-[var(--text-tertiary)] mt-0.5">
                          SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-extrabold text-[var(--text-primary)] tracking-tight">
                        {formattedTotal}
                      </p>
                      <p className="text-[11px] font-bold text-[var(--success)] bg-[var(--success)]/10 px-2 py-0.5 rounded-full inline-block mt-1 border border-[var(--success)]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                        {percentage}% of total
                      </p>
                    </div>
                  </div>

                  {/* Calculation Breakdown */}
                  <div className="flex items-center justify-between text-xs px-3.5 py-2.5 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-xl border border-[var(--border)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <span className="text-[var(--text-secondary)] font-medium">
                      <span className="font-bold text-[var(--text-primary)]">
                        {stock}
                      </span>{" "}
                      units
                    </span>
                    <X
                      size={12}
                      className="text-[var(--text-tertiary)]/50 mx-2"
                    />
                    <span className="text-[var(--text-secondary)] font-medium">
                      <span className="font-bold text-[var(--text-primary)]">
                        {formattedPrice}
                      </span>{" "}
                      / unit
                    </span>
                    <span className="text-[var(--text-tertiary)]/50 mx-2">
                      =
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {formattedTotal}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
