# Implementation Plan - AI Image Validation & Safety Guardrails

The goal is to implement strict validation in the AI analysis pipeline to ensure the system only processes relevant dental radiographs (OPG, Panoramic, Periapical) and rejects unrelated images.

## User Review Required

> [!IMPORTANT]
> **Safety Guardrail**: I am adding a "Relevance Check" as the first step of the AI analysis. If the AI detects that the uploaded image is not a dental radiograph, it will return a specific `INVALID_IMAGE_TYPE` error.
>
> **User Experience**: The app will display a "Clinical Rejection" screen instead of results if an invalid image (like a car, person, or non-clinical document) is uploaded.

## Proposed Changes

### 1. AI Edge Function (Validation Logic)
- **[MODIFY]** `supabase/functions/advanced-ai-analyze/index.ts`:
    - Update `GEMINI_SYSTEM_PROMPT` to include a required `is_valid_radiograph` check.
    - If `is_valid_radiograph` is false, the AI must return an error object instead of tooth classifications.
    - Explicitly instruct the AI to reject non-dental images (e.g., landscapes, animals, general objects).

### 2. Frontend Error Handling
- **[MODIFY]** `screens/AnalysisView.tsx`:
    - Update the analysis state to handle the `INVALID_IMAGE_TYPE` case.
    - Show a high-contrast "Clinical Rejection" message in the status area.
    - Disable the "Review Results" button if the image is rejected.

### 3. API Bridge
- **[MODIFY]** `api/analyze.ts`:
    - Ensure the rejection error is correctly propagated to the UI.

## Verification Plan

### Automated Tests
- **Backend Simulation**: Test the edge function with a "cat photo" (mock) and verify it returns the correct rejection JSON.
- **Type Check**: `npx tsc --noEmit`.

### Manual Verification
1.  **Positive Test**: Upload a real OPG image. Verify analysis proceeds to the Lab.
2.  **Negative Test**: Upload a completely unrelated image (e.g., a photo of a room).
3.  **Verification**: Confirm the app shows "Analysis Failed: Invalid Clinical Image" and prevents proceeding to Stage Classification.
