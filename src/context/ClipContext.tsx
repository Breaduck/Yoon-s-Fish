import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Clip } from '../types/clip';

interface ClipContextType {
  clips: Clip[];
  addClip: (clip: Clip) => void;
  removeClip: (id: string) => void;
  updateClipTitle: (id: string, title: string) => void;
  selectedClip: Clip | null;
  setSelectedClip: (clip: Clip | null) => void;
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

  const addClip = (clip: Clip) => {
    setClips((prev) => [...prev, clip]);
  };

  const removeClip = (id: string) => {
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedClip?.id === id) {
      setSelectedClip(null);
    }
  };

  const updateClipTitle = (id: string, title: string) => {
    setClips((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
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
      }}
    >
      {children}
    </ClipContext.Provider>
  );
};
