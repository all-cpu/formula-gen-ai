# FormulaGen AI

A bilingual, ad-supported Excel, WPS, and Google Sheets formula website built with Next.js, TypeScript, and Tailwind CSS.

## Product Direction

- The primary generator is a **local Smart Formula Builder**.
- It uses deterministic templates and a small natural-language helper.
- No AI service, no API key, no server-side API cost, and no user data leaves the browser.
- The Formula Explainer uses a built-in function reference.
- SEO guides embed a matching interactive formula builder.

## Features

- 18 structured formula tasks
- Excel / WPS / Google Sheets mode
- Copy-ready formula output
- Step-by-step explanation
- Compatibility alternatives
- Local natural-language prompt helper
- Drag-and-drop CSV/Excel sample data for column detection
- Local formula explainer
- 30 bilingual tutorial pages
- English / Simplified Chinese language toggle
- Sitemap, robots, Open Graph, and JSON-LD

## Local Development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Environment Variables

No API keys are required for the current local builder.

## Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Deploy with the default Next.js settings.
4. No server-side API key is needed.

## Important Note

Generated formulas should always be checked against your actual column layout and data types. Review critical financial calculations manually before using them in production.
