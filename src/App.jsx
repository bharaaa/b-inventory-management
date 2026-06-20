import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import {
  AnalyticsPage,
  SettingsPage,
} from "./pages/PlaceholderPages";
import WarehousePage from "./pages/WarehousePage";
import ActivityPage from "./pages/ActivityPage";
import ConnectionErrorView from "./components/layout/ConnectionErrorView";
import { ToastProvider } from "./contexts/ToastContext";
import { supabase } from "./services/supabaseClient";

function App() {
  const [connectionError, setConnectionError] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkConnection = async () => {
    setIsChecking(true);
    setConnectionError(false);
    try {
      // Simple ping to check connection
      const { error } = await supabase.from('products').select('id').limit(1);
      if (error && error.message === 'Failed to fetch') {
        setConnectionError(true);
      }
    } catch (err) {
      setConnectionError(true);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (connectionError) {
    return <ConnectionErrorView onRetry={checkConnection} />;
  }

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

export default App;
