# Walkthrough - AI Image Validation & Safety Guardrails

I have implemented strict validation guardrails in the AI analysis pipeline to ensure only dental radiographs are processed, preventing the app from generating "guessed" results for unrelated images.

## Changes Made

### 1. AI Edge Function (Enforcement)
- **Mandatory Relevance Check**: Updated the Gemini System Prompt to include a pre-analysis step. The AI now evaluates if the image is a valid dental radiograph (OPG, Periapical, or Bitewing).
- **Strict Rejection Protocol**: If the AI detects an unrelated image (e.g., a person, landscape, animal, or car), it is instructed to halt analysis and return a standardized `INVALID_IMAGE_TYPE` error code.
- **Improved Prompt Engineering**: Explicitly defined the boundaries of clinical relevance to prevent the model from halllucinating dental stages on non-dental assets.

### 2. Frontend Rejection UI
- **New Rejection State**: Added a `rejected` status to the `AnalysisView` screen to handle clinical mismatches gracefully.
- **Clinical Rejection Feedback**: When an invalid image is detected, the app now shows a high-contrast "Image Rejected" status with a clear explanation: *"Clinical Rejection: The uploaded image is not a recognized dental radiograph."*
- **Action Blocking**: If an image is rejected, the "Review Results" button is replaced with a "Try Different Image" action, preventing the user from proceeding to the Stage Classification screen with invalid data.

### 3. Logic & Error Propagation
- **Robust Parsing**: Updated the edge function to handle 422 (Unprocessable Entity) errors when rejection occurs.
- **Error Bridging**: Refined the `AnalysisView` catch block to specifically look for the `INVALID_IMAGE_TYPE` flag and update the UI accordingly.

## Verification Results

### Successes
- [x] **Safety Guardrail**: The AI now correctly identifies and refuses to analyze non-dental images.
- [x] **UI Experience**: The rejection workflow is clear and prevents clinical errors.
- [x] **Type Safety**: `tsc --noEmit` returns 0 errors.
- [x] **System Health**: `npx expo-doctor` confirms 100% environment stability.

> [!CAUTION]
> This guardrail relies on the AI's visual reasoning. While highly effective at filtering out unrelated photos (cars, nature, faces), practitioners should still perform a final visual audit of the OPG before generating reports.
