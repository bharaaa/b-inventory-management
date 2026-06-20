import React, { createContext, useContext, useState } from 'react';

const DrawerContext = createContext();

export function DrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState(null);
  const [payload, setPayload] = useState({});

  const openDrawer = (drawerType, drawerPayload = {}) => {
    setType(drawerType);
    setPayload(drawerPayload);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => {
      setType(null);
      setPayload({});
    }, 300); // Wait for animation before clearing content
  };

  return (
    <DrawerContext.Provider value={{ isOpen, type, payload, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
}
