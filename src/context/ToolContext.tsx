import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ArrowStyle } from '../types/drawing';

export type ToolType = 'reference-lines' | 'arrow' | 'pen' | 'eraser' | 'angle' | null;

interface ToolSettings {
  color: string;
  thickness: number;
  lineCount: number;
  verticalLineCount: number;
  lineThickness: number;
  showVerticalLines: boolean;
  arrowStyle: ArrowStyle;
  penThickness: number;
}

interface ToolContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  toolSettings: ToolSettings;
  updateToolSettings: (settings: Partial<ToolSettings>) => void;
  resetSettings: () => void;
  isFullscreen: boolean;
  setIsFullscreen: (fullscreen: boolean) => void;
  isComparisonMode: boolean;
  setIsComparisonMode: (enabled: boolean) => void;
}

const ToolContext = createContext<ToolContextType | null>(null);

export const useTool = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within ToolProvider');
  }
  return context;
};

interface ToolProviderProps {
  children: ReactNode;
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    color: '#10b981', // emerald
    thickness: 4,
    lineCount: 6,
    verticalLineCount: 1,
    lineThickness: 2,
    showVerticalLines: false,
    arrowStyle: 'solid',
    penThickness: 3,
  });

  const updateToolSettings = (settings: Partial<ToolSettings>) => {
    setToolSettings((prev) => ({ ...prev, ...settings }));
  };

  const resetSettings = () => {
    setToolSettings({
      color: '#10b981',
      thickness: 4,
      lineCount: 6,
      verticalLineCount: 1,
      lineThickness: 2,
      showVerticalLines: false,
      arrowStyle: 'solid',
      penThickness: 3,
    });
    setActiveTool(null);
  };

  return (
    <ToolContext.Provider
      value={{
        activeTool,
        setActiveTool,
        toolSettings,
        updateToolSettings,
        resetSettings,
        isFullscreen,
        setIsFullscreen,
        isComparisonMode,
        setIsComparisonMode,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};
