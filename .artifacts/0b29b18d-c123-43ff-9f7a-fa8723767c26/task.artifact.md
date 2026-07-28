# Task List: AI Image Validation & Safety Guardrails

## Phase 1: AI Edge Function Enforcement
- [x] Update Gemini System Prompt with "Relevance Check" instructions
- [x] Define standardized error JSON for non-dental images
- [x] Implement conditional logic to skip analysis if image is invalid

## Phase 2: UI Rejection Handling
- [x] Add `REJECTED` status to `AnalysisView.tsx`
- [x] Implement visual feedback for clinical rejection
- [x] Disable navigation to Results/Lab for invalid images

## Phase 3: Verification
- [x] End-to-end logic testing
- [x] Final `tsc` check
