import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Search, Pencil, Plus, Minus } from "lucide-react";
import DataTable from "../components/ui/DataTable";
import { useDrawer } from "../contexts/DrawerContext";
import { useToast } from "../contexts/ToastContext";
import { useInventory } from "../hooks/useInventory";
import { useCurrency } from "../hooks/useCurrency";
import { InventoryFilterBar } from "../components/inventory/InventoryFilterBar";
import { InventoryBulkActions } from "../components/inventory/InventoryBulkActions";

const sortOptions = {
  "last_updated_desc": "Recently Updated",
  "stock_asc": "Lowest Stock First",
  "stock_desc": "Highest Stock First",
  "name_asc": "Name (A-Z)",
  "name_desc": "Name (Z-A)"
};

function StockCell({ item, updateStock }: { item: any, updateStock: (id: string, current: number, delta: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(item.stock_count);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(item.stock_count);
  }, [item.stock_count]);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseInt(value.toString(), 10);
    if (!isNaN(parsed) && parsed !== item.stock_count && parsed >= 0) {
      const delta = parsed - item.stock_count;
      updateStock(item.id, item.stock_count, delta);
    } else {
      setValue(item.stock_count);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setValue(item.stock_count);
      setIsEditing(false);
    }
  };

  return (
    <div className="inline-flex items-center gap-0.5 bg-white/40 dark:bg-black/20 backdrop-blur-md border border-[var(--glass-border)] shadow-sm rounded-lg p-0.5" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => updateStock(item.id, item.stock_count, -1)}
        disabled={item.stock_count <= 0}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-black/5 dark:hover:bg-white/15 hover:text-[var(--text-primary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Minus size={14} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          autoFocus
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-12 text-center font-medium bg-white/60 dark:bg-black/40 backdrop-blur-sm border border-[var(--accent)] rounded-md px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="w-12 text-center font-medium cursor-text hover:bg-black/5 dark:hover:bg-white/15 hover:text-[var(--text-primary)] rounded-md px-1 py-0.5 transition-colors tooltip-trigger"
          title="Click to edit stock"
        >
          {item.stock_count.toLocaleString()}
        </span>
      )}

      <button
        onClick={() => updateStock(item.id, item.stock_count, 1)}
        className="p-1 rounded-md text-[var(--text-tertiary)] hover:bg-black/5 dark:hover:bg-white/15 hover:text-[var(--text-primary)] transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function InventoryPage() {
  const { openDrawer } = useDrawer();
  const { addToast } = useToast();
  const { items, loading, deleteItems, fetchItems, updateStock } = useInventory();
  const { formatPrice } = useCurrency();
  
  const [search, setSearch] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState("last_updated_desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const totalUsedCapacity = items.reduce((sum, item) => sum + (item.stock_count || 0), 0);

  const columns = [
    {
      key: "id",
      header: "ID",
      width: "w-16",
      render: (item: any) => <span className="font-mono text-xs text-[var(--text-tertiary)]">#{item.id}</span>
    },
    {
      key: "name",
      header: "Name",
      render: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--text-primary)]">{item.name}</span>
          {item.categories && (
            <span className="text-xs text-[var(--text-secondary)] mt-0.5">{item.categories.name}</span>
          )}
        </div>
      )
    },
    {
      key: "stock",
      header: "Stock",
      width: "w-40",
      render: (item: any) => <StockCell item={item} updateStock={updateStock} />
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (item: any) => (
        <span className="font-medium text-[var(--text-primary)]">
          {item.price ? formatPrice(item.price) : '-'}
        </span>
      ),
    },
    {
      key: "last_updated",
      header: "Last Updated",
      width: "w-32",
      render: (item: any) => (
        <span className="text-sm text-[var(--text-secondary)]">
          {new Date(item.last_updated).toLocaleDateString()}
        </span>
      )
    },
    {
      key: "actions",
      header: "",
      width: "w-16",
      align: "right",
      render: (item: any) => (
        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openDrawer('EDIT_ITEM', { item, totalUsedCapacity, onSuccess: fetchItems })}
            className="p-2 rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-md border border-[var(--glass-border)] shadow-sm text-[var(--text-tertiary)] hover:bg-white/60 dark:hover:bg-white/15 hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all tooltip-trigger"
            title="Edit Item"
          >
            <Pencil size={14} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  const filteredItems = useMemo(() => {
    let result = items;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        item =>
          item.name.toLowerCase().includes(lowerSearch) ||
          item.id.toString().includes(lowerSearch) ||
          (item.categories?.name || "").toLowerCase().includes(lowerSearch)
      );
    }
    return result;
  }, [items, search]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "stock_asc": return a.stock_count - b.stock_count;
        case "stock_desc": return b.stock_count - a.stock_count;
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        case "last_updated_desc":
        default: return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
      }
    });
  }, [filteredItems, sortBy]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(sortedItems.map(item => item.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  return (
    <div className="flex flex-col h-full min-h-0 pb-2">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight"
        >
          Inventory
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-sm text-[var(--text-tertiary)] mt-1"
        >
          Manage and track all inventory items
        </motion.p>
      </div>

      <InventoryFilterBar
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        openSort={openSort}
        setOpenSort={setOpenSort}
        sortOptions={sortOptions}
        filteredItemsCount={filteredItems.length}
        isSelectionMode={isSelectionMode}
        setIsSelectionMode={setIsSelectionMode}
        onSelectToggle={() => {
          setIsSelectionMode(!isSelectionMode);
          if (isSelectionMode) setSelectedIds([]);
        }}
        onNewItem={() => openDrawer('ADD_ITEM', { totalUsedCapacity, onSuccess: fetchItems })}
      />

      <DataTable
        columns={columns}
        data={sortedItems}
        loading={loading}
        emptyIcon={search ? Search : Package}
        emptyMessage={
          search ? (
            <div className="mt-3">
              <p className="font-medium text-[var(--text-secondary)]">No results found</p>
              <p className="text-sm mt-1">No items match "<span className="text-[var(--text-primary)] font-medium">{search}</span>"</p>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-medium text-[var(--text-secondary)]">No inventory data</p>
              <p className="text-sm mt-1">Items will appear here once added</p>
            </div>
          )
        }
        selectionMode={isSelectionMode}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onRowClick={(item: any) => openDrawer('PRODUCT_DETAIL', { 
          item, 
          onEdit: (i: any) => openDrawer('EDIT_ITEM', { item: i, totalUsedCapacity, onSuccess: fetchItems }) 
        })}
      />

      <InventoryBulkActions
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        setIsSelectionMode={setIsSelectionMode}
        onBulkDelete={async (ids) => {
          await deleteItems(ids);
          addToast("Items deleted successfully", "success");
        }}
        fetchItems={fetchItems}
      />
    </div>
  );
}
