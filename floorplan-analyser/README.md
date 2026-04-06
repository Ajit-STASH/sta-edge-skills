# Floor Plan Electrical Analyser

A Claude Vision powered React app for STA Smart Homes. Upload a floor plan (PDF or image) and get a full electrical point schedule in seconds.

## Features

- **PDF support** — multi-page PDFs rendered via PDF.js, page thumbnail picker to select the right floor
- **Image support** — PNG, JPG, WEBP
- **Estimates**: sockets, light switches, data points, TV points, light circuits, USB outlets, EV charger, cooker circuit, bathroom points, consumer unit ways
- **Standards**: UK Domestic BS 7671 18th Edition, UK Commercial, EU Domestic
- **Output**: summary cards, room breakdown table, assumptions, warnings
- **Export**: Copy report (plain text) or Export CSV

## How it works

1. Upload a PDF or image floor plan
2. For PDFs: page thumbnails render client-side via PDF.js — select the floor plan page
3. The selected page is sent to Claude Sonnet via the Anthropic API as a base64 image
4. Claude analyses the plan room by room and returns a structured JSON electrical schedule
5. Results display as a formatted table with summary totals

## Usage in Claude.ai

Open a new Claude conversation and paste the contents of `FloorplanAnalyser.jsx` as a React artifact. It calls the Anthropic API internally (no separate API key needed within Claude.ai).

## Stack

- React (hooks only, no router)
- PDF.js 3.11.174 (via cdnjs CDN)
- Anthropic Claude Sonnet (claude-sonnet-4-20250514)
- Pure CSS (no Tailwind, no component library)

## Notes

- All PDF rendering happens in the browser — no server required
- The API call goes directly to `api.anthropic.com/v1/messages`
- Estimates are indicative — always verify on-site
