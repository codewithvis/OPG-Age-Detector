import { create } from 'zustand';
import { Patient, OPGAnalysis, UserProfile } from '../types';

interface AppState {
  user: UserProfile | null;
  patients: Patient[];
  recentAnalyses: OPGAnalysis[];
  isOffline: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setPatients: (patients: Patient[]) => void;
  addPatient: (patient: Patient) => void;
  setRecentAnalyses: (analyses: OPGAnalysis[]) => void;
  addAnalysis: (analysis: OPGAnalysis) => void;
  setOfflineStatus: (status: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  patients: [],
  recentAnalyses: [],
  isOffline: false,

  setUser: (user) => set({ user }),
  setPatients: (patients) => set({ patients }),
  addPatient: (patient) => set((state) => ({
    patients: [patient, ...state.patients]
  })),
  setRecentAnalyses: (analyses) => set({ recentAnalyses: analyses }),
  addAnalysis: (analysis) => set((state) => ({
    recentAnalyses: [analysis, ...state.recentAnalyses]
  })),
  setOfflineStatus: (status) => set({ isOffline: status }),
}));
