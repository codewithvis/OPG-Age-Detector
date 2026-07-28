# Implementation Plan - AI Logic Alignment & UI Refinement

The goal is to align the data structures between the AI analysis engine and the clinical calculation engine, while polishing the diagnostic UI for better clarity.

## User Review Required

> [!IMPORTANT]
> **Data Standardization**: I am standardizing the AI pipeline to use **ISO 31-37** tooth numbering as the primary key. The calculation engine will be updated to map these to clinical names internally.
>
> **UI Visuals**: The "Laser Glow" effect is being toned down to ensure the radiograph remains the focal point during analysis.

## Proposed Changes

### 1. AI Backend Alignment
- **[MODIFY]** `supabase/functions/calculate-age/index.ts`:
    - Update `validateTeethData` to accept ISO number keys (`31`-`37`).
    - Support both simple string stages (`"G"`) and nested objects (`{ stage: "G", confidence: 0.9 }`).
    - Add a mapping helper to translate ISO numbers to descriptive names (e.g., `31` -> `central_incisor`).

### 2. UI Refinement
- **[MODIFY]** `screens/AnalysisView.tsx`:
    - Reduce `glowOpacity` max value from `0.8` to `0.3`.
    - Adjust `zIndex` or styling of `viewportGlow` to act as a border/ambient effect rather than an overlay.
    - Ensure the `scanLine` remains sharp and visible.

### 3. Frontend Data Flow
- **[MODIFY]** `api/analyze.ts`:
    - Ensure the mapping between `advanced-ai-analyze` and `calculate-age` is seamless.

## Verification Plan

### Automated Tests
- **Backend Simulation**: Use a scratch script to send mock ISO data to the `calculate-age` function and verify it calculates the maturity score correctly.
- **Type Check**: `npx tsc --noEmit` to ensure mappings don't introduce `any` types.

### Manual Verification
- **UI Visual Check**: Open the `AnalysisView` and verify the laser scan doesn't wash out the image.
- **End-to-End Flow**: Verify that results from the AI are correctly passed into the `StageClassificationScreen`.
