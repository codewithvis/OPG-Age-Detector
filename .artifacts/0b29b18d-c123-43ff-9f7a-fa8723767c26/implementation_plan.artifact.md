# Implementation Plan - Expo Config Schema & Asset Fixes

The goal is to resolve the schema validation errors in `app.json` and fix the asset compilation issues to unblock EAS builds.

## User Review Required

> [!IMPORTANT]
> **Square Icon Required**: `expo-doctor` confirms that `./assets/icons/app-icon.png` is **not square** (599x569). This is a hard requirement for Android/iOS builds. I will add a placeholder square icon if you don't have one ready, but for production, you MUST provide a 1024x1024 or 512x512 square PNG.
>
> **Missing Bundle Identifiers**: Your `ios` and `android` configurations are missing critical fields like `bundleIdentifier` (iOS) and `versionCode` (Android). I will add defaults to ensure schema completeness.

## Proposed Changes

### 1. App Configuration Polish
- **[MODIFY]** `app.json`:
    - Add `ios.bundleIdentifier` (e.g., `com.codewithvis.dentage`).
    - Add `android.versionCode` (starting at `1`).
    - Add `android.adaptiveIcon` configuration (optional but recommended for modern Android).
    - Ensure `web.favicon` is also pointing to a valid square asset.

### 2. Asset Integrity Check
- **[FIX]** `placeholder.png`: The EAS logs previously mentioned a failure in compiling this asset. I will attempt to verify its validity. If it remains broken, I will replace it with a standard placeholder.

### 3. Metro Configuration
- **[VERIFY]** `metro.config.js`: Ensure the recent fix for `blacklistRE` to `blockList` is working and not causing issues with asset resolution.

## Verification Plan

### Automated Tests
- `npx expo-doctor --verbose`: This must pass with 0 schema errors (except possibly the icon dimensions if not replaced).
- `npx expo config --type public`: Verify the resulting configuration is valid.

### Manual Verification
- **AAPT2 Compilation Test**: Run `npx expo prebuild --platform android` to verify that the native assets compile correctly.

## Open Questions
1. What should be the official `bundleIdentifier` for iOS? I will use `com.codewithvis.dentage` as a default.
2. Do you have a square version of the `app-icon.png`? If not, should I try to generate a square one by padding the current one (if I find a way) or just use a generic one for now?
