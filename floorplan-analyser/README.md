# Floor Plan Electrical Analyser v3

Claude Vision powered React app — upload a floor plan (PDF or image), get a full electrical schedule AND an annotated plan with icons drawn directly on the drawing.

## Features

- **PDF + image support** — multi-page PDFs with thumbnail page picker
- **Two-call architecture**: first call generates the room schedule, second call maps icon positions as % coordinates onto the plan
- **Annotated plan view** — coloured electrical icons overlaid on the floor plan via SVG
- **Icon legend** — click to toggle each icon type on/off
- **Export annotated PNG** — plan with icons baked in, ready to send to client or team
- **Schedule view** — full room breakdown table, summary cards, assumptions, warnings
- **Export CSV** — schedule ready for WeQuote or spreadsheet

## Icon types

| Icon | Colour | Meaning |
|------|--------|---------|
| Socket | Amber | Double socket outlet |
| Switch | Blue | Light switch |
| Data | Green | Cat6 data point |
| TV | Purple | TV/coax/HDMI point |
| Light | Yellow | Light circuit |
| USB | Orange | USB outlet |
| Special | Red | EV, cooker, special circuit |

## How it works

1. Upload PDF or image — PDF renders client-side via PDF.js
2. Select floor if multi-page
3. Hit **Analyse + Mark Up Plan**
4. Call 1: Claude Sonnet analyses rooms and returns electrical schedule (JSON)
5. Call 2: Claude Sonnet returns icon placements as x/y percentage coordinates
6. SVG overlay renders icons onto the plan at correct positions
7. Toggle icon types via legend, export as PNG

## Stack

- React (hooks), PDF.js 3.11.174, Anthropic Claude Sonnet (claude-sonnet-4-20250514)
- SVG overlay for icon rendering, Canvas API for PNG export
