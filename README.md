# 🦷 DentAge — Enterprise Clinical AI Edition

An enterprise-grade dental age estimation platform built with **React Native (Expo SDK 55)** and **Supabase**. DentAge leverages advanced AI to provide forensic-standard age estimation using Demirjian's stages of development for mandibular teeth.

---

## ✨ Enterprise Features

- 🏢 **Multi-Tenant Architecture** — Support for Organizations, Clinics, and tiered roles (`Enterprise Admin`, `Clinic Admin`, `Practitioner`).
- 🛡️ **AI Clinical Guardrails** — Automated image relevance check rejects non-dental radiographs (cars, faces, etc.) to ensure diagnostic integrity.
- 🤖 **Automated Diagnostic Lab** — Real-time AI staging of all 7 mandibular left teeth (ISO 31-37) with automated clinical morphology notes.
- 📸 **Unified Clinical Upload** — Seamlessly capture physical radiographs via camera or upload digital OPGs directly from the patient selection flow.
- 📊 **Clinical Intelligence** — Population maturity trends, accuracy tracking, and professional PDF report generation.
- 🌍 **Multi-Language Support** — Fully localized for English, Hindi, Telugu, Tamil, and Kannada using `i18next`.
- 🔐 **Clinical Security** — Role-based access control (RBAC), Row-Level Security (RLS), and full audit trails.

---

## 📱 Clinical Screens

| Screen | File | Description |
|--------|------|-------------|
| **Login** | `screens/LoginScreen.tsx` | Secure clinical login with "Clinical-Grade Encryption" |
| **Enterprise Dashboard** | `screens/EnterpriseAdminDashboard.tsx` | Global stats, clinic management, and audit trails |
| **Manage Clinics** | `screens/ManageClinicsScreen.tsx` | Facility lifecycle and staff allocation |
| **Patient Selection** | `screens/PatientSelectionScreen.tsx` | Unified patient registration and OPG upload flow |
| **AI Analysis** | `screens/AnalysisView.tsx` | High-contrast viewport with automated "Laser Scan" animation |
| **Diagnostic Lab** | `screens/StageClassificationScreen.tsx` | Automated AI staging review with visual standard references |
| **Results** | `screens/ResultsDashboardScreen.tsx` | Maturity scores, age variance charts, and PDF export |
| **Settings** | `screens/SettingsScreen.tsx` | Clinical preferences and multi-language toggles |

---

## 🧭 Navigation Flow

```
Login → Home (Practitioner Dashboard)
Login → EnterpriseAdmin (Admin Dashboard)
Home → PatientSelection → [Image Picker] → AI Analysis → Diagnostic Lab → Results
EnterpriseAdmin → ManageClinics → ManagePractitioners
Settings → ChangePassword / Language Selection
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com/) project
- A [Google AI (Gemini)](https://aistudio.google.com/apikey) API key

### 1. Clone & Install

```bash
git clone https://github.com/codewithvis/DentAge.git
cd DentAge
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Supabase Setup

#### Enterprise Schema

Run the SQL in **`supabase-enterprise-setup.sql`** in your Supabase SQL Editor. This initializes the multi-tenant architecture:
- **`organizations`** & **`clinics`** tables
- **`profiles`** with RBAC columns (`role`, `org_id`, `clinic_id`)
- **`analyses`** with clinic-scoped RLS policies
- **`population_maturity_trends`** clinical view

#### Edge Functions

Deploy the Advanced AI Analysis pipeline:

```bash
supabase functions deploy advanced-ai-analyze
supabase functions deploy calculate-age
```

#### Edge Function Secrets

```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
```

### 4. Run the App

```bash
npx expo start
```

---

## 🏗️ Technical Stack

- **Framework:** React Native (Expo SDK 55)
- **Language:** TypeScript (Strict Mode)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **AI Engine:** Gemini 1.5 Flash (via Google Generative AI)
- **State:** Zustand (Atomic clinical state)
- **Localization:** i18next & react-i18next
- **Animations:** React Native Reanimated (Diagnostic Scan effects)
- **Reports:** Expo Print & Sharing (PDF Generation)

---

## 🔬 AI Diagnostic Logic

1. **Relevance Check** — AI validates if the image is a dental radiograph.
2. **Detection** — AI classifies Demirjian stages A-H for ISO teeth 31-37.
3. **Normalization** — `calculate-age` function maps AI output to clinical maturity scores.
4. **Verification** — Practitioners review automated findings against built-in visual standards before finalization.

---

## 📄 License

ISC

---

## 🔗 Links

- **Repository:** [github.com/codewithvis/DentAge](https://github.com/codewithvis/DentAge)
- **Issues:** [github.com/codewithvis/DentAge/issues](https://github.com/codewithvis/DentAge/issues)
