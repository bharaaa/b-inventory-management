import { Search, SlidersHorizontal, X, Plus, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/Button";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  openSort: boolean;
  setOpenSort: (val: boolean) => void;
  sortOptions: Record<string, string>;
  filteredItemsCount: number;
  isSelectionMode: boolean;
  setIsSelectionMode: (val: boolean) => void;
  onSelectToggle: () => void;
  onNewItem: () => void;
}

export function InventoryFilterBar({
  search,
  setSearch,
  sortBy,
  setSortBy,
  openSort,
  setOpenSort,
  sortOptions,
  filteredItemsCount,
  isSelectionMode,
  onSelectToggle,
  onNewItem
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5"
    >
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          id="inventory-search"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 text-sm bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20 transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="relative" data-sort-menu>
        <Button
          variant="secondary"
          onClick={() => setOpenSort(!openSort)}
          leftIcon={<SlidersHorizontal size={15} />}
        >
          {sortOptions[sortBy]}
        </Button>

        {openSort && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 sm:left-0 mt-2 w-56 bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-xl shadow-sm z-20 py-1.5 overflow-hidden"
          >
            {Object.entries(sortOptions).map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setSortBy(key);
                  setOpenSort(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                  sortBy === key
                    ? "text-[var(--accent)] bg-[var(--accent-subtle)] font-medium"
                    : "text-[var(--text-secondary)] hover:bg-black/[0.03] hover:text-[var(--text-primary)]"
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <div className="text-sm text-[var(--text-tertiary)] hidden sm:block ml-auto">
        {filteredItemsCount} {filteredItemsCount === 1 ? "item" : "items"}
      </div>

      <Button
        variant={isSelectionMode ? "outline" : "secondary"}
        className={isSelectionMode ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]" : "sm:ml-4"}
        onClick={onSelectToggle}
        leftIcon={<ListChecks size={16} />}
      >
        <span className="hidden sm:inline">Select</span>
      </Button>

      <Button
        variant="primary"
        onClick={onNewItem}
        leftIcon={<Plus size={16} />}
        className="sm:ml-4"
      >
        New Item
      </Button>
    </motion.div>
  );
}
