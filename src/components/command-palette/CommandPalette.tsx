import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { Package } from 'lucide-react';

import { useCommandPaletteContext } from '../../contexts/CommandPaletteContext';
import { useDrawer } from '../../contexts/DrawerContext';
import { useRecentItems } from '../../hooks/useRecentItems';
import { ProductService } from '../../services/product.service';
import { staticCommands, Command } from '../../data/commandRegistry';

import { CommandInput } from './CommandInput';
import { CommandGroup } from './CommandGroup';
import { CommandItem } from './CommandItem';
import { Product } from '../../types/domain';

export function CommandPalette() {
  const { isOpen, closePalette, searchQuery, setSearchQuery } = useCommandPaletteContext();
  const navigate = useNavigate();
  const { openDrawer } = useDrawer();
  const { recentCommandIds, addRecentCommand } = useRecentItems();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch all products once on mount (or when palette opens if we want to be always up-to-date)
  useEffect(() => {
    if (isOpen && products.length === 0) {
      ProductService.getAllProducts().then(setProducts).catch(console.error);
    }
  }, [isOpen]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Context passed to actions
  const commandContext = useMemo(() => ({
    navigate,
    openDrawer,
    closePalette,
    products
  }), [navigate, openDrawer, closePalette, products]);

  // Setup Fuse instances
  const commandsFuse = useMemo(() => new Fuse(staticCommands, {
    keys: ['title', 'keywords', 'category'],
    threshold: 0.4,
  }), []);

  const productsFuse = useMemo(() => new Fuse(products, {
    keys: ['name', 'id', 'categories.name'],
    threshold: 0.3,
  }), [products]);

  // Compute Results
  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      // Empty state: Show recent commands or default suggestions
      const recents = recentCommandIds
        .map(id => staticCommands.find(c => c.id === id))
        .filter(Boolean) as Command[];
      
      const suggestions = staticCommands.filter(c => ['nav-dashboard', 'nav-inventory', 'action-add-product'].includes(c.id));

      return {
        recent: recents.length > 0 ? recents : suggestions,
        pages: [],
        actions: [],
        smart: [],
        products: []
      };
    }

    // Fuzzy search
    const commandResults = commandsFuse.search(searchQuery).map(res => res.item);
    const productResults = productsFuse.search(searchQuery).map(res => res.item);

    return {
      recent: [],
      pages: commandResults.filter(c => c.category === 'Pages'),
      actions: commandResults.filter(c => c.category === 'Actions'),
      smart: commandResults.filter(c => c.category === 'Smart'),
      products: productResults.slice(0, 5) // Limit products to top 5
    };
  }, [searchQuery, recentCommandIds, commandsFuse, productsFuse]);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    const arr: Array<{ type: 'command'; item: Command } | { type: 'product'; item: Product }> = [];
    results.recent.forEach(c => arr.push({ type: 'command', item: c }));
    results.pages.forEach(c => arr.push({ type: 'command', item: c }));
    results.actions.forEach(c => arr.push({ type: 'command', item: c }));
    results.smart.forEach(c => arr.push({ type: 'command', item: c }));
    results.products.forEach(p => arr.push({ type: 'product', item: p }));
    return arr;
  }, [results]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(flatResults.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatResults.length) % Math.max(flatResults.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex]);

  const executeItem = useCallback((selected: { type: 'command'; item: Command } | { type: 'product'; item: Product }) => {
    if (selected.type === 'command') {
      addRecentCommand(selected.item.id);
      selected.item.action(commandContext);
    } else {
      // Product action: open drawer
      openDrawer('PRODUCT_DETAIL', { item: selected.item });
      closePalette();
    }
  }, [commandContext, addRecentCommand, closePalette, openDrawer]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        {/* Dim backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={closePalette}
        />

        {/* Palette Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative w-full max-w-[750px] bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-[var(--glass-border)] shadow-[var(--glass-shadow-lg)] rounded-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '70vh' }}
        >
          <CommandInput value={searchQuery} onChange={setSearchQuery} isOpen={isOpen} />

          <div className="flex-1 overflow-y-auto p-2 min-h-[300px] scrollbar-hide">
            {flatResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <p className="text-[var(--text-secondary)] font-medium">No results found</p>
                <p className="text-[var(--text-tertiary)] text-sm mt-1">Try searching for a product name, SKU, or command.</p>
              </div>
            ) : (
              <>
                {searchQuery ? (
                  <>
                    <CommandGroup heading="Smart Suggestions">
                      {results.smart.map(c => {
                        const globalIndex = flatResults.findIndex(f => f.type === 'command' && f.item.id === c.id);
                        return (
                          <CommandItem 
                            key={c.id} 
                            id={c.id} 
                            title={c.title} 
                            icon={c.icon} 
                            isActive={selectedIndex === globalIndex}
                            onHover={() => setSelectedIndex(globalIndex)}
                            onSelect={() => executeItem({ type: 'command', item: c })}
                          />
                        );
                      })}
                    </CommandGroup>

                    <CommandGroup heading="Pages">
                      {results.pages.map(c => {
                        const globalIndex = flatResults.findIndex(f => f.type === 'command' && f.item.id === c.id);
                        return (
                          <CommandItem 
                            key={c.id} 
                            id={c.id} 
                            title={c.title} 
                            icon={c.icon} 
                            isActive={selectedIndex === globalIndex}
                            onHover={() => setSelectedIndex(globalIndex)}
                            onSelect={() => executeItem({ type: 'command', item: c })}
                          />
                        );
                      })}
                    </CommandGroup>

                    <CommandGroup heading="Actions">
                      {results.actions.map(c => {
                        const globalIndex = flatResults.findIndex(f => f.type === 'command' && f.item.id === c.id);
                        return (
                          <CommandItem 
                            key={c.id} 
                            id={c.id} 
                            title={c.title} 
                            icon={c.icon} 
                            isActive={selectedIndex === globalIndex}
                            onHover={() => setSelectedIndex(globalIndex)}
                            onSelect={() => executeItem({ type: 'command', item: c })}
                          />
                        );
                      })}
                    </CommandGroup>

                    <CommandGroup heading="Products">
                      {results.products.map(p => {
                        const globalIndex = flatResults.findIndex(f => f.type === 'product' && f.item.id === p.id);
                        return (
                          <CommandItem 
                            key={p.id} 
                            id={p.id} 
                            title={p.name} 
                            subtitle={p.id}
                            icon={Package} 
                            badge={{
                              text: p.stock_count > 10 ? 'In Stock' : p.stock_count > 0 ? 'Low Stock' : 'Out of Stock',
                              variant: p.stock_count > 10 ? 'success' : p.stock_count > 0 ? 'warning' : 'error'
                            }}
                            isActive={selectedIndex === globalIndex}
                            onHover={() => setSelectedIndex(globalIndex)}
                            onSelect={() => executeItem({ type: 'product', item: p })}
                          />
                        );
                      })}
                    </CommandGroup>
                  </>
                ) : (
                  <CommandGroup heading={recentCommandIds.length > 0 ? "Recent" : "Suggestions"}>
                    {results.recent.map(c => {
                      const globalIndex = flatResults.findIndex(f => f.type === 'command' && f.item.id === c.id);
                      return (
                        <CommandItem 
                          key={c.id} 
                          id={c.id} 
                          title={c.title} 
                          icon={c.icon} 
                          isActive={selectedIndex === globalIndex}
                          onHover={() => setSelectedIndex(globalIndex)}
                          onSelect={() => executeItem({ type: 'command', item: c })}
                        />
                      );
                    })}
                  </CommandGroup>
                )}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-[var(--border)] px-4 py-3 flex items-center justify-between text-[11px] text-[var(--text-tertiary)] bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-sans">↑</kbd> <kbd className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-sans">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-sans">↵</kbd> to select</span>
            </div>
            <div>
              <span className="flex items-center gap-1"><kbd className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded font-sans">ESC</kbd> to close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
