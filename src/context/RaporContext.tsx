import React, { createContext, useContext, useState } from 'react';
import { RaporSubject, defaultRaporData, loadStoredRapor, saveStoredRapor, calculateRaporMetrics } from '../data/raporData';

interface RaporContextType {
  raporData: RaporSubject[];
  updateSubjectScore: (subjId: string, smtIdx: number, value: number) => void;
  saveAllRapor: () => void;
  resetRapor: () => void;
  getMetrics: (supportSubjectNames?: string[]) => {
    filledCount: number;
    totalSubjects: number;
    overallAvg: string;
    supportAvg: string;
  };
}

const RaporContext = createContext<RaporContextType | undefined>(undefined);

export const RaporProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [raporData, setRaporData] = useState<RaporSubject[]>(() => loadStoredRapor());

  const updateSubjectScore = (subjId: string, smtIdx: number, value: number) => {
    let cleanVal = isNaN(value) ? 0 : value;
    if (cleanVal < 0) cleanVal = 0;
    if (cleanVal > 100) cleanVal = 100;

    setRaporData(prev => {
      const next = prev.map(subj => {
        if (subj.id === subjId) {
          const updatedScores = [...subj.scores];
          updatedScores[smtIdx] = cleanVal;
          return { ...subj, scores: updatedScores };
        }
        return subj;
      });
      return next;
    });
  };

  const saveAllRapor = () => {
    saveStoredRapor(raporData);
  };

  const resetRapor = () => {
    const fresh = JSON.parse(JSON.stringify(defaultRaporData));
    setRaporData(fresh);
    saveStoredRapor(fresh);
  };

  const getMetrics = (supportSubjectNames: string[] = []) => {
    return calculateRaporMetrics(raporData, supportSubjectNames);
  };

  return (
    <RaporContext.Provider value={{ raporData, updateSubjectScore, saveAllRapor, resetRapor, getMetrics }}>
      {children}
    </RaporContext.Provider>
  );
};

export function useRapor() {
  const ctx = useContext(RaporContext);
  if (!ctx) {
    throw new Error("useRapor must be used within a RaporProvider");
  }
  return ctx;
}
