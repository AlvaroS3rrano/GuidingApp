
import React, { createContext, ReactNode, useState } from 'react';

interface AppContextProps {
  targetNode: any;
  setTargetNode: (node: any) => void;
  targetMapData: any;
  setTargetMapData: (data: any) => void;
}

export const AppContext = createContext<AppContextProps>({
  targetNode: null,
  setTargetNode: () => {},
  targetMapData: null,
  setTargetMapData: () => {},
});


export function AppProvider({ children }: { children: ReactNode }) {
  const [targetNode, setTargetNode] = useState<any>(null);
  const [targetMapData, setTargetMapData] = useState<any>(null);

  return (
    <AppContext.Provider
      value={{
        targetNode,
        setTargetNode,
        targetMapData,
        setTargetMapData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
