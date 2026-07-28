import { supabase } from '../services/supabase';

/**
 * Upload and analyze OPG radiograph with full error logging
 * @param imageBase64 - Base64 encoded image
 * @param userId - User ID for authentication
 * @param method - Diagnostic method (OPG, Panoramic, Periapical)
 * @param useEdgeAI - Whether to use the proprietary edge model
 */
export const analyzeOPG = async (
  imageBase64: string,
  userId: string,
  method: string = 'OPG',
  useEdgeAI: boolean = true
): Promise<any> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
        throw new Error("Local session access token is missing entirely. The user is logged out.");
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

    const resRaw = await fetch(`${supabaseUrl}/functions/v1/advanced-ai-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        image: imageBase64,
        user_id: userId,
        method: method,
        use_edge_model: useEdgeAI
      })
    });

    const serverError = await resRaw.json().catch(() => null);

    if (!resRaw.ok) {
      const detail = serverError?.error || serverError?.message || resRaw.statusText || 'Failed to upload and analyze OPG image';
      const step = serverError?.step || 'unknown';
      throw new Error(`[${step}] ${detail}`);
    }

    if (serverError && serverError.data) {
        return {
            ...serverError.data.ai_result,
            tooth_development_stage: serverError.data.analysis?.tooth_development_stage || JSON.stringify(serverError.data.ai_result?.teeth),
            analysis: serverError.data.analysis?.analysis || "Analysis completed based on Demirjian stages."
        };
    }

    return serverError;
  } catch (err: any) {
    console.error("ANALYZE OPG ERROR:", err.message || err);
    throw err;
  }
};

/**
 * Submit confirmed AI analysis to edge function to generate
 * clinical outputs and calculate the exact age and maturity.
 */
export const finalizeAnalysis = async (aiAnalysisResult: any, patient_id: string | number): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('calculate-age', {
    body: {
      ai_result: aiAnalysisResult,
      patient_id,
    },
  });

  if (error) {
    throw new Error(error.message || 'Failed to finalize analysis');
  }

  return data;
};
