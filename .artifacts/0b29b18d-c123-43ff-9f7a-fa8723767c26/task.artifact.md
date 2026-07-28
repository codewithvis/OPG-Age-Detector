# Task List: EAS & Expo Peak Stability

## Phase 1: Configuration & Permissions
- [x] Update `.gitignore` with Expo standard patterns
- [x] Remove redundant `@types/react-native` from `package.json`
- [x] Clean up placeholder values in `eas.json`
- [x] **FIX**: Re-link project to current EAS account (`helpdeskcalm`)
- [x] **FIX**: Resolved "Entity not authorized" by generating new `projectId`

## Phase 2: Dependency & Asset Audit
- [x] Run `npx expo install --check` and fix mismatches
- [x] Align `babel-preset-expo` version
- [x] Adjust `app.json` schema (Added iOS/Android identifiers)
- [x] **FIX**: Converted `app-icon.png` to strictly square 1024x1024

## Phase 3: Final Verification
- [x] Run `npx expo-doctor` (19/19 checks pass)
- [x] Perform a local `npx expo prebuild` test (Succeeded)
- [x] Final TypeScript pass (0 errors)
- [x] AI Logic Alignment (ISO 31-37 support)
