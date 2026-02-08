import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ArrowStyle } from '../types/drawing';

export type ToolType = 'reference-lines' | 'arrow' | 'pen' | 'eraser' | 'angle' | null;

interface ToolSettings {
  color: string;
  thickness: number;
  lineCount: number;
  verticalLineCount: number;
  lineThickness: number;
  showHorizontalLines: boolean;
  showVerticalLines: boolean;
  arrowStyle: ArrowStyle;
  penThickness: number;
  waterlinePosition: number | null;
  showWaterline: boolean;
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
  isToolPanelCollapsed: boolean;
  setIsToolPanelCollapsed: (collapsed: boolean) => void;
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
  const [isToolPanelCollapsed, setIsToolPanelCollapsed] = useState(false);

  // Fixed waterline position at 34.7%
  const WATERLINE_Y = 34.7;

  const loadWaterline = () => {
    // Always start with 38%, ignore localStorage
    return WATERLINE_Y;
  };

  const [toolSettings, setToolSettings] = useState<ToolSettings>({
    color: '#10b981', // emerald
    thickness: 4,
    lineCount: 6,
    verticalLineCount: 1,
    lineThickness: 6,
    showHorizontalLines: true,
    showVerticalLines: false,
    arrowStyle: 'solid',
    penThickness: 3,
    waterlinePosition: loadWaterline(),
    showWaterline: true,
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
      lineThickness: 6,
      showHorizontalLines: true,
      showVerticalLines: false,
      arrowStyle: 'solid',
      penThickness: 3,
      waterlinePosition: loadWaterline(),
      showWaterline: true,
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
        isToolPanelCollapsed,
        setIsToolPanelCollapsed,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};
