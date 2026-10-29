# ⚡ Solor-Bijli

React + Vite electricity analytics demo: dashboard, rule-based insights, slab-based bill predictor, appliance calculator, usage history (CSV/print), alerts and settings. Runs fully in the browser with localStorage.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Honest limits
- All data is **demo data**; there are no live meter readings.
- Insights are a **rule-based engine** (see `src/utils/insights.js`); no AI API is called.
- Alerts use thresholds and a 2-standard-deviation rule (`src/utils/calc.js`); they do not detect electrical faults.
- Default tariff slabs are a sample. Set your provider's slabs in Settings. Actual bills vary.

## Optional extensions
Add an Express backend that holds your LLM API key in `.env` and exposes `/api/insights`; never put keys in client code. Supabase can replace localStorage for auth and storage.

## Structure
`src/{components,pages,context,hooks,services,utils,data}`; calculations live in `utils/`.

## Login, signup and dashboards
- Mobile-number + OTP only. User: `/login`, `/signup` -> `/dashboard`. Admin: `/admin/login` -> `/admin`.
- **Demo mode** (no env vars): OTP is simulated and shown on screen, no SMS is sent. Demo admin number: 9999999999.
- **Supabase mode:** copy `.env.example` to `.env`, fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, enable the Phone provider and an SMS provider (e.g. Twilio) in Supabase, then run `supabase/schema.sql`. Make an admin with the SQL at the bottom of that file. Roles come from the `profiles` table; users cannot change their own role (row-level security).
- Users and readings still live in localStorage; moving them to Supabase tables is the next step. Client-side route guards are not a security boundary, so protect real data with RLS.

## New features
- **Solar Savings** (`/solar`): panels, generation, bill saving, payback, 25-year net saving, CO2 avoided. Assumptions are shown on the page.
- **Carbon Footprint** (`/carbon`): monthly CO2 from an editable emission factor, tree equivalent, solar offset.
- **PDF report**: Usage History -> PDF report (jsPDF, loaded on demand).
- **Supabase data**: in Supabase mode each user's settings, appliances and readings are stored per user (`user_data`, `readings`) with RLS. Admins see users via `profiles` and the `admin_user_usage()` function, and can suspend users. Re-run `supabase/schema.sql` after pulling this update. New accounts start with demo data. In demo mode data stays in localStorage.
# Solor-Bijli
