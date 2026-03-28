import React, { createContext, PropsWithChildren, useContext, useState } from 'react';
import { calculateTotalMaturityScore, maturityScoreToDentalAge } from '../constants/demirjianTable';

type AssessmentData = {
  // Image data
  ogpImageUri: string | null;
  
  // Patient info
  patientId: string | null;
  gender: 'Male' | 'Female' | null;
  
  // Tooth stage data (Demirjian stages A-H)
  toothStages: Record<string, string | null>; // toothId -> stage
  
  // Analysis results
  maturityScore: number | null;
  dentalAge: number | null;
  
  // UI states
  loading: boolean;
  error: string | null;
  
  // Step tracking
  completedSteps: string[];
};

type AssessmentContextType = {
  state: AssessmentData;
  
  // Setters
  setOgpImage: (uri: string | null) => void;
  setPatientId: (id: string | null) => void;
  setGender: (gender: 'Male' | 'Female' | null) => void;
  setToothStage: (toothId: string, stage: string | null) => void;
  setAnalysisResult: (maturityScore: number, dentalAge: number, patientId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markStepComplete: (step: string) => void;
  
  // Getters
  isOgpUploaded: () => boolean;
  isGenderSelected: () => boolean;
  areAllStagesSelected: () => boolean;
  validateBeforeAnalysis: () => string | null;
};

const AssessmentContext = createContext<AssessmentContextType | null>(null);

export default function AssessmentProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AssessmentData>({
    ogpImageUri: null,
    patientId: null,
    gender: null,
    toothStages: {},
    maturityScore: null,
    dentalAge: null,
    loading: false,
    error: null,
    completedSteps: [],
  });

  // Setters
  const setOgpImage = (uri: string | null) => {
    setState(prev => ({ ...prev, ogpImageUri: uri }));
  };

  const setPatientId = (id: string | null) => {
    setState(prev => ({ ...prev, patientId: id }));
  };

  const setGender = (gender: 'Male' | 'Female' | null) => {
    setState(prev => ({ ...prev, gender: gender }));
  };

  const setToothStage = (toothId: string, stage: string | null) => {
    setState(prev => ({
      ...prev,
      toothStages: {
        ...prev.toothStages,
        [toothId]: stage,
      },
    }));
  };

  const setAnalysisResult = (maturityScore: number, dentalAge: number, patientId: string) => {
    setState(prev => ({
      ...prev,
      maturityScore,
      dentalAge,
      patientId,
    }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const markStepComplete = (step: string) => {
    setState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, step],
    }));
  };

  // Getters
  const isOgpUploaded = () => !!state.ogpImageUri;
  
  const isGenderSelected = () => !!state.gender;
  
  const areAllStagesSelected = () => {
    // Check if all 7 teeth (31-37) have stages selected
    const requiredTeeth = ['31', '32', '33', '34', '35', '36', '37'];
    return requiredTeeth.every(tooth => !!state.toothStages[tooth]);
  };
  
    const validateBeforeAnalysis = () => {
        if (!state.ogpImageUri) {
            return 'OPG image is required';
        }
        
        if (!state.gender) {
            return 'Patient gender must be selected';
        }
        
        if (!areAllStagesSelected()) {
            return 'All 7 teeth must have Demirjian stages assigned';
        }
        
        return null;
    };

  const value: AssessmentContextType = {
    state,
    setOgpImage,
    setPatientId,
    setGender,
    setToothStage,
    setAnalysisResult,
    setLoading,
    setError,
    markStepComplete,
    isOgpUploaded,
    isGenderSelected,
    areAllStagesSelected,
    validateBeforeAnalysis,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export const useAssessment = () => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};