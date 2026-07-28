import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_SYSTEM_PROMPT = `You are a dental radiology AI specialized in forensic and clinical age estimation.

FIRST STEP: RELEVANCE CHECK
Identify if the provided image is a dental radiograph (OPG/Panoramic, Periapical, or Bitewing).
- If the image is NOT a dental radiograph (e.g., a person, a room, an animal, a car, a general document, or a medical image of a different body part), you MUST return:
  {"error": "INVALID_IMAGE_TYPE", "message": "The uploaded image is not a recognized dental radiograph."}

SECOND STEP: ANALYSIS (Only if relevant)
Analyze the radiograph and determine the Demirjian development stages for mandibular teeth (ISO 31-37).

OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "is_valid_radiograph": true,
  "estimated_age": <number>,
  "age_range": "min-max",
  "confidence": <0.0-1.0>,
  "teeth": {
    "31": "A-H", "32": "A-H", "33": "A-H", "34": "A-H", "35": "A-H", "36": "A-H", "37": "A-H"
  },
  "analysis": "Summary of findings."
}`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { image, method = 'OPG', use_edge_model = true } = body;

    if (!image) {
      throw new Error("Missing image data in request body.");
    }

    // 1. Check for Proprietary Edge Model
    const PROPRIETARY_API_KEY = Deno.env.get('PROPRIETARY_AI_KEY');
    const PROPRIETARY_API_URL = Deno.env.get('PROPRIETARY_AI_URL');

    if (use_edge_model && PROPRIETARY_API_URL && PROPRIETARY_API_KEY) {
      try {
        const response = await fetch(PROPRIETARY_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': PROPRIETARY_API_KEY,
          },
          body: JSON.stringify({ image, diagnostic_method: method })
        });

        if (response.ok) {
          const aiResult = await response.json();
          return new Response(JSON.stringify({
            data: {
              ai_result: aiResult,
              analysis: aiResult
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } else {
          const errText = await response.text();
          console.warn(`Proprietary AI returned ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.error("Proprietary AI failed, falling back to Gemini:", err);
      }
    }

    // 2. Fallback to Gemini 1.5 Flash
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured. Please set it in Supabase Secrets.");
    }

    // Clean base64 data: remove prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const requestBody = {
      contents: [{
        parts: [
          { text: `DIAGNOSTIC_METHOD: ${method}\n\n${GEMINI_SYSTEM_PROMPT}` },
          { inlineData: { mimeType: "image/png", data: base64Data } }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        topK: 1,
        topP: 0.8
      }
    };

    // Use a valid model name: gemini-1.5-flash
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const geminiRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errorBody = await geminiRes.text();
      throw new Error(`Gemini API error (${geminiRes.status}): ${errorBody}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Gemini returned an empty response.");
    }

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("RAW AI OUTPUT (No JSON):", rawText);
      throw new Error("Invalid AI response format: No JSON found in output.");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON PARSE ERROR. RAW MATCH:", jsonMatch[0]);
      throw new Error("Failed to parse JSON from AI response.");
    }

    // Check for AI-level rejection
    if (parsedResult.error === "INVALID_IMAGE_TYPE") {
      return new Response(JSON.stringify({
        error: "INVALID_IMAGE_TYPE",
        message: parsedResult.message || "This image is not a valid dental radiograph."
      }), {
        status: 422, // Unprocessable Entity
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Wrap in data.ai_result to match the expected format in api/analyze.ts
    return new Response(JSON.stringify({
      data: {
        ai_result: parsedResult,
        analysis: parsedResult
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Advanced AI Analyze Error:", errorMessage);

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
