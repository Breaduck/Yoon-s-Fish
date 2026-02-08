import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Clip } from '../types/clip';

interface ClipContextType {
  clips: Clip[];
  addClip: (clip: Clip) => void;
  removeClip: (id: string) => void;
  updateClipTitle: (id: string, title: string) => void;
  selectedClip: Clip | null;
  setSelectedClip: (clip: Clip | null) => void;
  selectedClips: string[];
  toggleClipSelection: (id: string) => void;
  clearSelection: () => void;
}

const ClipContext = createContext<ClipContextType | null>(null);

export const useClips = () => {
  const context = useContext(ClipContext);
  if (!context) {
    throw new Error('useClips must be used within ClipProvider');
  }
  return context;
};

interface ClipProviderProps {
  children: ReactNode;
}

export const ClipProvider: React.FC<ClipProviderProps> = ({ children }) => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [selectedClips, setSelectedClips] = useState<string[]>([]);

  const addClip = (clip: Clip) => {
    setClips((prev) => [...prev, clip]);
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedClip?.id === id) {
      setSelectedClip(null);
    }
    setSelectedClips((prev) => prev.filter((clipId) => clipId !== id));
  };

  const updateClipTitle = (id: string, title: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  };

  const toggleClipSelection = (id: string) => {
    setSelectedClips((prev) =>
      prev.includes(id) ? prev.filter((clipId) => clipId !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedClips([]);
  };

  return (
    <ClipContext.Provider
      value={{
        clips,
        addClip,
        removeClip,
        updateClipTitle,
        selectedClip,
        setSelectedClip,
        selectedClips,
        toggleClipSelection,
        clearSelection,
      }}
    >
      {children}
    </ClipContext.Provider>
  );
};
