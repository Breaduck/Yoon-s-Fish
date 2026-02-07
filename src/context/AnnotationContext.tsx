import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnnotationData, Arrow, FreeDraw, ReferenceLine, AngleMeasurement } from '../types/drawing';

interface AnnotationContextType {
  annotations: AnnotationData;
  addArrow: (arrow: Arrow) => void;
  removeArrow: (id: string) => void;
  addFreeDraw: (draw: FreeDraw) => void;
  removeFreeDraw: (id: string) => void;
  addAngle: (angle: AngleMeasurement) => void;
  removeAngle: (id: string) => void;
  setReferenceLines: (lines: ReferenceLine[]) => void;
  getAnnotationsForTime: (timestamp: number) => { arrows: Arrow[]; freeDrawings: FreeDraw[]; angles: AngleMeasurement[] };
  clearAnnotations: () => void;
  clearDrawings: () => void;
}

const AnnotationContext = createContext<AnnotationContextType | null>(null);

export const useAnnotations = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within AnnotationProvider');
  }
  return context;
};

interface AnnotationProviderProps {
  children: ReactNode;
}

export const AnnotationProvider: React.FC<AnnotationProviderProps> = ({ children }) => {
  const [annotations, setAnnotations] = useState<AnnotationData>({
    arrows: [],
    freeDrawings: [],
    referenceLines: [],
    angles: [],
  });

  const addArrow = useCallback((arrow: Arrow) => {
    setAnnotations((prev) => ({
      ...prev,
      arrows: [...prev.arrows, arrow],
    }));
  }, []);

  const removeArrow = useCallback((id: string) => {
    setAnnotations((prev) => ({
      ...prev,
      arrows: prev.arrows.filter((arrow) => arrow.id !== id),
    }));
  }, []);

  const addFreeDraw = useCallback((draw: FreeDraw) => {
    setAnnotations((prev) => ({
      ...prev,
      freeDrawings: [...prev.freeDrawings, draw],
    }));
  }, []);

  const removeFreeDraw = useCallback((id: string) => {
    setAnnotations((prev) => ({
      ...prev,
      freeDrawings: prev.freeDrawings.filter((draw) => draw.id !== id),
    }));
  }, []);

  const addAngle = useCallback((angle: AngleMeasurement) => {
    setAnnotations((prev) => ({
      ...prev,
      angles: [...prev.angles, angle],
    }));
  }, []);

  const removeAngle = useCallback((id: string) => {
    setAnnotations((prev) => ({
      ...prev,
      angles: prev.angles.filter((angle) => angle.id !== id),
    }));
  }, []);

  const setReferenceLines = useCallback((lines: ReferenceLine[]) => {
    setAnnotations((prev) => ({
      ...prev,
      referenceLines: lines,
    }));
  }, []);

  const getAnnotationsForTime = useCallback((timestamp: number) => {
    // Return all annotations drawn before or at current timestamp
    // This makes drawings persist throughout the video
    return {
      arrows: annotations.arrows.filter((arrow) => arrow.timestamp <= timestamp),
      freeDrawings: annotations.freeDrawings.filter((draw) => draw.timestamp <= timestamp),
      angles: annotations.angles.filter((angle) => angle.timestamp <= timestamp),
    };
  }, [annotations.arrows, annotations.freeDrawings, annotations.angles]);

  const clearAnnotations = useCallback(() => {
    setAnnotations({
      arrows: [],
      freeDrawings: [],
      referenceLines: [],
      angles: [],
    });
  }, []);

  const clearDrawings = useCallback(() => {
    setAnnotations((prev) => ({
      ...prev,
      arrows: [],
      freeDrawings: [],
      angles: [],
    }));
  }, []);

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        addArrow,
        removeArrow,
        addFreeDraw,
        removeFreeDraw,
        addAngle,
        removeAngle,
        setReferenceLines,
        getAnnotationsForTime,
        clearAnnotations,
        clearDrawings,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};
