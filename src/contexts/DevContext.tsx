import { createContext, useContext, useState, ReactNode } from 'react';

interface DevContextType {
  isDevAdmin: boolean;
  toggleDevAdmin: () => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [isDevAdmin, setIsDevAdmin] = useState(false);

  const toggleDevAdmin = () => {
    setIsDevAdmin(prev => !prev);
  };

  return (
    <DevContext.Provider value={{ isDevAdmin, toggleDevAdmin }}>
      {children}
    </DevContext.Provider>
  );
}

export function useDev() {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDev must be used within a DevProvider');
  }
  return context;
}
