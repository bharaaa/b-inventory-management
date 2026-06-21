import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  BarChart3, 
  Activity, 
  Settings,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Tags,
  AlertTriangle,
  History,
  DollarSign
} from 'lucide-react';

export type CommandCategory = 'Pages' | 'Actions' | 'Products' | 'Recent' | 'Smart';

export interface CommandContext {
  navigate: (path: string) => void;
  openDrawer: (type: string, data?: any) => void;
  closePalette: () => void;
  products: any[];
}

export interface Command {
  id: string;
  title: string;
  category: CommandCategory;
  icon?: React.ElementType;
  shortcut?: string[];
  action: (context: CommandContext) => void;
  keywords?: string[];
}

export const staticCommands: Command[] = [
  // PAGES
  {
    id: 'nav-dashboard',
    title: 'Go to Dashboard',
    category: 'Pages',
    icon: LayoutDashboard,
    keywords: ['home', 'start', 'main'],
    action: ({ navigate, closePalette }) => {
      navigate('/');
      closePalette();
    }
  },
  {
    id: 'nav-inventory',
    title: 'Go to Inventory',
    category: 'Pages',
    icon: Package,
    keywords: ['products', 'items', 'stock'],
    action: ({ navigate, closePalette }) => {
      navigate('/inventory');
      closePalette();
    }
  },
  {
    id: 'nav-warehouse',
    title: 'Go to Warehouse',
    category: 'Pages',
    icon: Warehouse,
    keywords: ['map', 'capacity', 'storage'],
    action: ({ navigate, closePalette }) => {
      navigate('/warehouse');
      closePalette();
    }
  },
  {
    id: 'nav-analytics',
    title: 'Go to Analytics',
    category: 'Pages',
    icon: BarChart3,
    keywords: ['charts', 'graphs', 'data', 'reports'],
    action: ({ navigate, closePalette }) => {
      navigate('/analytics');
      closePalette();
    }
  },
  {
    id: 'nav-activity',
    title: 'Go to Activity',
    category: 'Pages',
    icon: Activity,
    keywords: ['history', 'logs', 'recent'],
    action: ({ navigate, closePalette }) => {
      navigate('/activity');
      closePalette();
    }
  },
  {
    id: 'nav-settings',
    title: 'Go to Settings',
    category: 'Pages',
    icon: Settings,
    keywords: ['preferences', 'config', 'theme'],
    action: ({ navigate, closePalette }) => {
      navigate('/settings');
      closePalette();
    }
  },

  // ACTIONS
  {
    id: 'action-add-product',
    title: 'Add Product',
    category: 'Actions',
    icon: Plus,
    keywords: ['create', 'new item', 'add item'],
    action: ({ openDrawer, closePalette }) => {
      openDrawer('ADD_ITEM');
      closePalette();
    }
  },
  {
    id: 'action-stock-in',
    title: 'Stock In',
    category: 'Actions',
    icon: ArrowDownToLine,
    keywords: ['receive', 'add stock', 'inbound'],
    action: ({ navigate, closePalette }) => {
      // User can go to inventory to select a product and adjust stock
      navigate('/inventory');
      closePalette();
    }
  },
  {
    id: 'action-stock-out',
    title: 'Stock Out',
    category: 'Actions',
    icon: ArrowUpFromLine,
    keywords: ['dispatch', 'remove stock', 'outbound', 'sell'],
    action: ({ navigate, closePalette }) => {
      navigate('/inventory');
      closePalette();
    }
  },
  
  // SMART COMMANDS
  {
    id: 'smart-low-stock',
    title: 'View Low Stock Products',
    category: 'Smart',
    icon: AlertTriangle,
    keywords: ['low stock', 'out of stock', 'empty', 'critical'],
    action: ({ openDrawer, closePalette, products }) => {
      const lowStockItems = products.filter(p => p.stock_count < 10);
      const totalUsedCapacity = products.reduce((sum, item) => sum + (item.stock_count || 0), 0);
      openDrawer('LOW_STOCK', { 
        lowStockItems, 
        onViewItem: (item: any) => openDrawer('PRODUCT_DETAIL', { 
          item, 
          onEdit: (i: any) => openDrawer('EDIT_ITEM', { item: i, totalUsedCapacity }) 
        }) 
      });
      closePalette();
    }
  },
  {
    id: 'smart-recent-activity',
    title: 'View Recent Activity',
    category: 'Smart',
    icon: History,
    keywords: ['recent activity', 'latest logs', 'what happened'],
    action: ({ navigate, closePalette }) => {
      navigate('/activity');
      closePalette();
    }
  },
  {
    id: 'smart-top-value',
    title: 'View Top Value Products',
    category: 'Smart',
    icon: DollarSign,
    keywords: ['top value', 'highest stock', 'expensive'],
    action: ({ navigate, closePalette }) => {
      navigate('/warehouse');
      closePalette();
    }
  }
];
