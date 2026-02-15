# DealScope AI

AI-powered private equity deal screening, analysis, and LBO modeling — built by Gaurav Singh.

Upload a CIM or executive summary. Screen against your investment criteria, run deep-dive analysis with graded sections, and model leveraged buyout returns with interactive assumptions.

## Features

- **Quick Screen** — Score a CIM against configurable acquisition criteria
- **Deep Dive** — Comprehensive 6-section graded analysis with financial extraction
- **Head-to-Head** — Compare two CIMs side-by-side across 6 dimensions
- **Interactive LBO Model** — Document-driven prefills, year-by-year projections with:
  - Revenue growth + EBITDA margin growth assumptions
  - Taxes, maintenance capex, working capital
  - Earnout modeling with equity shortfall handling
  - Cash sweep with per-year toggles
  - DSCR validation, IRR goal-seek vs. historical CAGR
- **Incognito Mode** — Anonymize all identifying information for NDA compliance

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "DealScope AI v1"
git remote add origin https://github.com/YOUR_USERNAME/dealscope-ai.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your API key from [console.anthropic.com](https://console.anthropic.com/settings/keys)
4. Click Deploy

### 3. Done

Your app will be live at `https://dealscope-ai.vercel.app` (or your custom domain).

## Local Development

```bash
cp .env.local.example .env.local
# Edit .env.local with your Anthropic API key
npm install
npm run dev
```

## Cost

Each analysis costs ~$0.02–0.05 (Sonnet) or ~$0.15–0.30 (Opus). The LBO model is pure client-side math — no API calls after initial analysis.

## Tech Stack

- Next.js 14 (App Router)
- Claude API (Sonnet 4 / Opus 4)
- Zero external UI libraries — pure React + inline styles
