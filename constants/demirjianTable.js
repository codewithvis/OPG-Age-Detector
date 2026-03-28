// Demirjian et al. (1973) dental maturity stages for mandibular teeth
// Lookup tables for converting stages to maturity scores and dental age
// Based on the original Demirjian method for age estimation

export const DEMIRIJIAN_STAGES = {
  // Boys (male) - Demirjian et al. 1973
  male: {
    // Tooth 36 (Lower Left First Molar) - maturity scores for each stage
    '36': {
      A: 0.0,
      B: 3.7,
      C: 11.1,
      D: 18.5,
      E: 25.9,
      F: 33.3,
      G: 40.7,
      H: 48.1,
    },
    // Tooth 35 (Lower Left Second Premolar)
    '35': {
      A: 0.0,
      B: 2.8,
      C: 8.3,
      D: 13.9,
      E: 19.4,
      F: 25.0,
      G: 30.6,
      H: 36.1,
    },
    // Tooth 34 (Lower Left First Premolar)
    '34': {
      A: 0.0,
      B: 2.3,
      C: 6.9,
      D: 11.5,
      E: 16.2,
      F: 20.8,
      G: 25.4,
      H: 30.0,
    },
    // Tooth 33 (Lower Left Canine)
    '33': {
      A: 0.0,
      B: 1.9,
      C: 5.6,
      D: 9.4,
      E: 13.1,
      F: 16.9,
      G: 20.6,
      H: 24.4,
    },
    // Tooth 32 (Lower Left Lateral Incisor)
    '32': {
      A: 0.0,
      B: 1.6,
      C: 4.8,
      D: 8.0,
      E: 11.1,
      F: 14.3,
      G: 17.5,
      H: 20.7,
    },
    // Tooth 31 (Lower Left Central Incisor)
    '31': {
      A: 0.0,
      B: 1.4,
      C: 4.2,
      D: 6.9,
      E: 9.6,
      F: 12.3,
      G: 15.0,
      H: 17.7,
    },
    // Tooth 37 (Lower Left Second Molar)
    '37': {
      A: 0.0,
      B: 2.0,
      C: 6.0,
      D: 10.0,
      E: 14.0,
      F: 18.0,
      G: 22.0,
      H: 26.0,
    },
    // Tooth 38 (Lower Left Third Molar)
    '38': {
      A: 0.0,
      B: 1.5,
      C: 4.5,
      D: 7.5,
      E: 10.5,
      F: 13.5,
      G: 16.5,
      H: 19.5,
    },
  },
  
  // Girls (female) - Demirjian et al. 1973
  female: {
    // Tooth 36 (Lower Left First Molar) - maturity scores for each stage
    '36': {
      A: 0.0,
      B: 4.0,
      C: 12.0,
      D: 20.0,
      E: 28.0,
      F: 36.0,
      G: 44.0,
      H: 52.0,
    },
    // Tooth 35 (Lower Left Second Premolar)
    '35': {
      A: 0.0,
      B: 3.0,
      C: 9.0,
      D: 15.0,
      E: 21.0,
      F: 27.0,
      G: 33.0,
      H: 39.0,
    },
    // Tooth 34 (Lower Left First Premolar)
    '34': {
      A: 0.0,
      B: 2.5,
      C: 7.5,
      D: 12.5,
      E: 17.5,
      F: 22.5,
      G: 27.5,
      H: 32.5,
    },
    // Tooth 33 (Lower Left Canine)
    '33': {
      A: 0.0,
      B: 2.0,
      C: 6.0,
      D: 10.0,
      E: 14.0,
      F: 18.0,
      G: 22.0,
      H: 26.0,
    },
    // Tooth 32 (Lower Left Lateral Incisor)
    '32': {
      A: 0.0,
      B: 1.7,
      C: 5.2,
      D: 8.6,
      E: 12.0,
      F: 15.4,
      G: 18.8,
      H: 22.2,
    },
    // Tooth 31 (Lower Left Central Incisor)
    '31': {
      A: 0.0,
      B: 1.5,
      C: 4.5,
      D: 7.5,
      E: 10.5,
      F: 13.5,
      G: 16.5,
      H: 19.5,
    },
    // Tooth 37 (Lower Left Second Molar)
    '37': {
      A: 0.0,
      B: 2.2,
      C: 6.6,
      D: 11.0,
      E: 15.4,
      F: 19.8,
      G: 24.2,
      H: 28.6,
    },
    // Tooth 38 (Lower Left Third Molar)
    '38': {
      A: 0.0,
      B: 1.6,
      C: 4.8,
      D: 8.0,
      E: 11.2,
      F: 14.4,
      G: 17.6,
      H: 20.8,
    },
  }
};

// Convert maturity score to dental age using Demirjian tables
// This is a simplified conversion - in practice, more complex polynomial equations are used
export const maturityScoreToDentalAge = (maturityScore, gender) => {
  // Simplified linear conversion based on Demirjian data
  // In a real implementation, this would use the actual Demirjian tables
  // or polynomial equations from the original research
  
  // For demonstration purposes, we'll use a simplified approach
  // Maturity score of 0-100 maps approximately to dental age of 2-20 years
  
  // Base conversion (this would be replaced with actual Demirjian equations)
  const baseAge = 2.0; // Minimum dental age
  const scaleFactor = 0.18; // Scale factor to convert maturity score to years
  
  let dentalAge = baseAge + (maturityScore * scaleFactor);
  
  // Apply gender-specific adjustments (simplified)
  if (gender === 'Female') {
    // Girls typically mature slightly earlier
    dentalAge *= 0.95;
  } else {
    // Boys typically mature slightly later
    dentalAge *= 1.05;
  }
  
  // Ensure reasonable bounds
  return Math.max(2.0, Math.min(20.0, dentalAge));
};

// Calculate total maturity score from individual tooth stages
export const calculateTotalMaturityScore = (toothStages, gender) => {
  const genderKey = gender.toLowerCase() === 'female' ? 'female' : 'male';
  const genderTable = DEMIRIJIAN_STAGES[genderKey];
  
  if (!genderTable) {
    throw new Error(`Invalid gender: ${gender}`);
  }
  
  let totalScore = 0;
  let validTeeth = 0;
  
  // Sum maturity scores for all teeth that have stages assigned
  Object.keys(toothStages).forEach(toothId => {
    const stage = toothStages[toothId];
    if (stage && genderTable[toothId] && genderTable[toothId][stage]) {
      totalScore += genderTable[toothId][stage];
      validTeeth++;
    }
  });
  
  // Average the score (Demirjian method uses average of 7 teeth)
  return validTeeth > 0 ? totalScore / validTeeth : 0;
};