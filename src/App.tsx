import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import WarehousePage from "./pages/WarehousePage";
import ActivityPage from "./pages/ActivityPage";
import ConnectionErrorView from "./components/layout/ConnectionErrorView";
import SplashScreen from "./components/layout/SplashScreen";
import { ToastProvider } from "./contexts/ToastContext";
import { DrawerProvider } from "./contexts/DrawerContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { CommandPaletteProvider } from "./contexts/CommandPaletteContext";
import GlobalSideDrawer from "./components/ui/GlobalSideDrawer";
import { CommandPalette } from "./components/command-palette/CommandPalette";
import { supabase } from "./services/supabaseClient";

function App() {
  const [connectionError, setConnectionError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionError(false);
    
    // Enforce a minimum 1.5s delay for the splash screen
    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));
    
    // The actual database ping
    const dbPing = async () => {
      try {
        const { error } = await supabase.from('products').select('id').limit(1);
        if (error && error.message === 'Failed to fetch') {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    };

    const [_, isConnected] = await Promise.all([minDelay, dbPing()]);
    
    if (!isConnected) {
      setConnectionError(true);
    }
    
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (isChecking) {
    return <SplashScreen />;
  }

  if (connectionError) {
    return <ConnectionErrorView onRetry={checkConnection} />;
  }

  return (
    <PreferencesProvider>
      <ToastProvider>
        <DrawerProvider>
          <CommandPaletteProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="warehouse" element={<WarehousePage />} />
                <Route path="activity" element={<ActivityPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
            <GlobalSideDrawer />
            <CommandPalette />
          </CommandPaletteProvider>
        </DrawerProvider>
      </ToastProvider>
    </PreferencesProvider>
  );
}

export default App;
