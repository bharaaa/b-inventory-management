import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import BulkEditModal from "./BulkEditModal";
import { Button } from "../ui/Button";

interface Props {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  setIsSelectionMode: (val: boolean) => void;
  onBulkDelete: (ids: string[]) => void;
  fetchItems: () => void;
}

export function InventoryBulkActions({
  selectedIds,
  setSelectedIds,
  setIsSelectionMode,
  onBulkDelete,
  fetchItems
}: Props) {
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);

  return (
    <>
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-8 left-1/2 z-40 bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] shadow-2xl shadow-black/10 rounded-full px-6 py-3 flex items-center gap-6"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              <span className="text-[var(--accent)]">{selectedIds.length}</span> item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="w-px h-6 bg-[var(--border)]" />
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBulkEditModal(true)}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Pencil size={16} />
                Edit Selected
              </button>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="text-sm font-medium text-[var(--error)] hover:opacity-70 transition-opacity flex items-center gap-2 cursor-pointer"
              >
                <Trash2 size={16} />
                Delete Selected
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedIds([]);
                setIsSelectionMode(false);
              }}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors ml-2 cursor-pointer"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBulkDeleteConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative bg-[var(--bg-card)] backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Selected Items</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">{selectedIds.length} items</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowBulkDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  className="flex-1"
                  onClick={() => {
                    onBulkDelete(selectedIds);
                    setShowBulkDeleteConfirm(false);
                    setSelectedIds([]);
                    setIsSelectionMode(false);
                  }}
                >
                  Yes, Delete All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        selectedIds={selectedIds}
        onSuccess={() => {
          fetchItems();
          setSelectedIds([]);
          setIsSelectionMode(false);
        }}
      />
    </>
  );
}
