import { motion, AnimatePresence } from 'framer-motion';
import { useDrawer } from '../../contexts/DrawerContext';

import AddItemForm from '../inventory/AddItemForm';
import EditItemForm from '../inventory/EditItemForm';
import ProductDetailView from '../inventory/ProductDetailView';
import ActivityDetailView from '../activity/ActivityDetailView';
import LowStockView from '../dashboard/LowStockView';
import TotalValueView from '../dashboard/TotalValueView';

export default function GlobalSideDrawer() {
  const { isOpen, type, payload, closeDrawer } = useDrawer();

  // Determine width based on type, most are md:w-[480px], some sm:w-[480px]
  const isWider = type === 'ADD_ITEM' || type === 'EDIT_ITEM' || type === 'ACTIVITY_DETAIL';
  const widthClass = isWider ? 'md:w-[480px]' : 'sm:w-[480px]';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/20 dark:bg-white/2 backdrop-blur-[3px]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`glass-panel relative w-[calc(100%-2rem)] ${widthClass} h-full z-[101] flex flex-col rounded-3xl overflow-hidden`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex-1 flex flex-col min-h-0 w-full h-full"
              >
                {type === 'ADD_ITEM' && <AddItemForm isOpen={isOpen} {...payload} onClose={closeDrawer} />}
                {type === 'EDIT_ITEM' && <EditItemForm isOpen={isOpen} {...payload} onClose={closeDrawer} />}
                {type === 'PRODUCT_DETAIL' && <ProductDetailView isOpen={isOpen} {...payload} onClose={closeDrawer} />}
                {type === 'ACTIVITY_DETAIL' && <ActivityDetailView isOpen={isOpen} {...payload} onClose={closeDrawer} />}
                {type === 'LOW_STOCK' && <LowStockView isOpen={isOpen} {...payload} onClose={closeDrawer} />}
                {type === 'TOTAL_VALUE' && <TotalValueView isOpen={isOpen} {...payload} onClose={closeDrawer} />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
