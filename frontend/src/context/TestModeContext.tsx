import React, { createContext, useContext, useState } from 'react';

interface TestModeContextValue {
  isTestFullscreen: boolean;
  setIsTestFullscreen: (value: boolean) => void;
}

const TestModeContext = createContext<TestModeContextValue | undefined>(undefined);

export const TestModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTestFullscreen, setIsTestFullscreen] = useState(false);
  return (
    <TestModeContext.Provider value={{ isTestFullscreen, setIsTestFullscreen }}>
      {children}
    </TestModeContext.Provider>
  );
};

export const useTestMode = () => {
  const ctx = useContext(TestModeContext);
  if (!ctx) {
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return ctx;
};