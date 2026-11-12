import React, { createContext, useCallback, useContext, useState } from 'react';
import { RaporSubject, getDefaultRapor, loadStoredRapor, saveStoredRapor, calculateRaporMetrics } from '../data/raporData';

type RaporMetrics = ReturnType<typeof calculateRaporMetrics>;

interface RaporContextType {
  getRapor: (studentId: string) => RaporSubject[];
  updateSubjectScore: (studentId: string, subjId: string, smtIdx: number, value: number) => void;
  saveAllRapor: (studentId: string) => void;
  resetRapor: (studentId: string) => void;
  getMetrics: (studentId: string, supportSubjectNames?: string[]) => RaporMetrics;
}

const RaporContext = createContext<RaporContextType | undefined>(undefined);

/**
 * Rapor is stored per student. Edits live in memory until saved; each student's data is loaded
 * lazily from localStorage the first time it is read.
 */
export const RaporProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [byStudent, setByStudent] = useState<Record<string, RaporSubject[]>>({});

  const getRapor = useCallback(
    (studentId: string): RaporSubject[] => byStudent[studentId] ?? loadStoredRapor(studentId),
    [byStudent]
  );

  const updateSubjectScore = (studentId: string, subjId: string, smtIdx: number, value: number) => {
    let cleanVal = isNaN(value) ? 0 : value;
    if (cleanVal < 0) cleanVal = 0;
    if (cleanVal > 100) cleanVal = 100;

    setByStudent((prev) => {
      const base = prev[studentId] ?? loadStoredRapor(studentId);
      const next = base.map((subj) => {
        if (subj.id !== subjId) return subj;
        const updatedScores = [...subj.scores];
        updatedScores[smtIdx] = cleanVal;
        return { ...subj, scores: updatedScores };
      });
      return { ...prev, [studentId]: next };
    });
  };

  const saveAllRapor = (studentId: string) => {
    saveStoredRapor(getRapor(studentId), studentId);
  };

  const resetRapor = (studentId: string) => {
    const fresh = getDefaultRapor(studentId);
    setByStudent((prev) => ({ ...prev, [studentId]: fresh }));
    saveStoredRapor(fresh, studentId);
  };

  const getMetrics = (studentId: string, supportSubjectNames: string[] = []) =>
    calculateRaporMetrics(getRapor(studentId), supportSubjectNames);

  return (
    <RaporContext.Provider value={{ getRapor, updateSubjectScore, saveAllRapor, resetRapor, getMetrics }}>
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
