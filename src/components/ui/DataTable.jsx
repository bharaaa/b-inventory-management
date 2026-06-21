import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

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

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyIcon: EmptyIcon,
  emptyMessage = "No items found.",
  onRowClick,
  selectionMode = false,
  selectedIds = [],
  onSelectAll,
  onSelectOne,
  keyExtractor = (item) => item.id,
}) {
  const allSelected = selectedIds.length > 0 && selectedIds.length === data.length && data.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col flex-1 min-h-0"
    >
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-10 bg-[var(--bg-card)] backdrop-blur-md shadow-[0_1px_0_0_var(--border)]">
            <tr>
              {/* Selection Checkbox Header */}
              {selectionMode && (
                <th className="p-0 align-middle">
                  <div className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden flex items-center justify-center py-4 w-[68px] px-6 opacity-100`}>
                    <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border border-[var(--border)] rounded-[4px] bg-[var(--bg-card)] checked:bg-[var(--accent)] checked:border-[var(--accent)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
                        checked={allSelected}
                        onChange={onSelectAll}
                      />
                      <Check size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                    </div>
                  </div>
                </th>
              )}

              {/* Data Headers */}
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-6 py-4 text-xs uppercase font-medium text-[var(--text-tertiary)] tracking-wider ${col.width || ""} ${col.align ? `text-${col.align}` : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-[var(--border)] bg-transparent"
          >
            <AnimatePresence mode="wait">
              {loading && data.length === 0 ? (
                // Loading Skeleton
                <motion.tr key="loading" exit={{ opacity: 0 }}>
                  <td colSpan={columns.length + (selectionMode ? 1 : 0)} className="p-0">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex border-b border-[var(--border)] last:border-b-0">
                        {selectionMode && (
                          <div className="flex items-center justify-center py-4 w-[68px] px-6">
                            <div className="w-4 h-4 rounded bg-[rgba(0,0,0,0.04)] animate-pulse flex-shrink-0" />
                          </div>
                        )}
                        {columns.map((col, colIdx) => (
                          <div key={colIdx} className={`px-6 py-4 ${col.width || "flex-1"} ${col.align === "right" ? "ml-auto flex justify-end" : ""}`}>
                            <div className={`h-4 bg-[rgba(0,0,0,0.04)] rounded-md animate-pulse ${col.skeletonWidth || "w-3/4"}`} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </td>
                </motion.tr>
              ) : data.length === 0 ? (
                // Empty State
                <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td colSpan={columns.length + (selectionMode ? 1 : 0)} className="text-center py-16 text-[var(--text-tertiary)]">
                    {EmptyIcon && <EmptyIcon size={40} className="mx-auto mb-3 opacity-30" strokeWidth={1} />}
                    {emptyMessage}
                  </td>
                </motion.tr>
              ) : (
                // Data Rows
                data.map((item, idx) => {
                  const id = keyExtractor(item);
                  const isSelected = selectedIds.includes(id);

                  return (
                    <motion.tr
                      key={id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      layout
                      onClick={() => onRowClick?.(item)}
                      className={`border-b border-[var(--border)] last:border-b-0 transition-colors duration-150 ${onRowClick ? "cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02]" : "hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"} ${isSelected ? "bg-[var(--accent-subtle)]" : ""}`}
                    >
                      {/* Selection Checkbox Cell */}
                      {selectionMode && (
                        <td className="p-0 align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] overflow-hidden flex items-center justify-center py-4 w-[68px] px-6">
                            <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
                              <input
                                type="checkbox"
                                className="peer appearance-none w-5 h-5 border border-[var(--border)] rounded-[4px] bg-[var(--bg-card)] checked:bg-[var(--accent)] checked:border-[var(--accent)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
                                checked={isSelected}
                                onChange={() => onSelectOne?.(id)}
                              />
                              <Check size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Data Cells */}
                      {columns.map((col, colIdx) => (
                        <td
                          key={col.key || colIdx}
                          onClick={(e) => {
                            if (col.stopPropagation) e.stopPropagation();
                          }}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${col.align ? `text-${col.align}` : ""}`}
                        >
                          {col.render ? col.render(item, idx) : item[col.key]}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
}
