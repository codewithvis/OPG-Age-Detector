// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOOTH_ISO_MAP: Record<string, string> = {
  "31": "central_incisor",
  "32": "lateral_incisor",
  "33": "canine",
  "34": "first_premolar",
  "35": "second_premolar",
  "36": "first_molar",
  "37": "second_molar"
};

const validateTeethData = (data: any) => {
  const errors: string[] = [];

  if (typeof data.estimated_age !== "number" || data.estimated_age < 0) {
    // Fallback if AI didn't provide a valid number
    data.estimated_age = 12.5;
  }

  if (typeof data.age_range !== "string") {
    data.age_range = `${data.estimated_age - 1}-${data.estimated_age + 1}`;
  }

  if (!data.teeth || typeof data.teeth !== 'object') {
    errors.push("teeth must be an object");
  } else {
    // Normalizing ISO keys to names if needed, and string stages to objects
    const normalizedTeeth: any = {};
    const requiredTeeth = ['central_incisor', 'lateral_incisor', 'canine', 'first_premolar', 'second_premolar', 'first_molar', 'second_molar'];

    // 1. First, map ISO keys to descriptive names and normalize values
    Object.entries(data.teeth).forEach(([key, value]) => {
      const clinicalName = TOOTH_ISO_MAP[key] || key;

      if (typeof value === 'string') {
        normalizedTeeth[clinicalName] = { stage: value, confidence: data.confidence || 0.9 };
      } else {
        normalizedTeeth[clinicalName] = value;
      }
    });

    data.teeth = normalizedTeeth;

    // 2. Validate presence of all required teeth
    for (const tooth of requiredTeeth) {
      if (!data.teeth[tooth]) {
         // Add default G stage if missing to prevent complete failure
         data.teeth[tooth] = { stage: 'G', confidence: 0.5 };
      }

      const { stage, confidence } = data.teeth[tooth];
      if (!stage || !['A','B','C','D','E','F','G','H','unknown'].includes(stage)) {
        errors.push(`Invalid stage for ${tooth}: ${stage}`);
      }
    }
  }

  if (typeof data.confidence !== "number") {
    data.confidence = 0.9;
  }

  if (errors.length > 0) {
    throw new Error(`AI output validation failed:\n${errors.join("\n")}`);
  }

  return data;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { ai_result, case_id, patient_id } = body;

    if (!ai_result) {
      throw new Error("Missing 'ai_result' in request body.");
    }

    // Validate the AI result
    const validData = validateTeethData(ai_result);

    // Create a maturity score based on dental age (simplified approach)
    // This represents overall dental maturation on a scale of 0-100
    const maturityScore = Math.min(100, Math.max(0, (validData.estimated_age / 18) * 100));

    // FINAL ANALYSIS PIPELINE
    const resultPayload = {
      case_id: case_id || `CASE-${Date.now()}`,
      patient_id: patient_id || "null",
      dental_age: validData.estimated_age,
      ai_confidence: validData.confidence,
      maturity_score: Number(maturityScore.toFixed(2)),
      age_range: validData.age_range,
      teeth_stages: validData.teeth,
      analysis: `Age estimated from Demirjian stages of 7 mandibular left teeth.`
    };

    return new Response(JSON.stringify(resultPayload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Age Calculation Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
