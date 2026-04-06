# STA Edge Skills

Custom Agent Skills for [Google AI Edge Gallery](https://github.com/google-ai-edge/gallery) — built for STA Smart Homes on-site use.

All skills run **100% on-device** via Gemma 4 with no internet required after initial model download.

---

## Skills

### 🔌 `lutron-site-assistant`
On-site Lutron lighting control assistant covering Homeworks QSX, RadioRA 3, and DALI systems.

**Capabilities:**
- Circuit count estimation — quoted vs actual, per-room variance, delta reporting
- Load calculation — per-circuit load analysis with derating (MLV, ELV, LED, fluorescent, DALI)
- Cable label scheme generation — STA format (C1–C8 circuits, PP1-P1 networking), print-ready output
- Wire run / home-run planning — cable length estimates, drum quantities, floor-based grouping

**Load into Edge Gallery:**
1. Open AI Edge Gallery → Agent Skills → Skill Manager → **(+)** → Add skill from URL
2. Enter the raw URL of `lutron-site-assistant/SKILL.md`

---

## Structure

```
sta-edge-skills/
└── lutron-site-assistant/
    ├── SKILL.md          ← Gemma system prompt + tool definitions
    └── scripts/
        └── index.html    ← JS calculation engine (runs in hidden webview)
```

---

## Adding Skills

Each skill follows the [AI Edge Gallery skill spec](https://github.com/google-ai-edge/gallery/tree/main/skills):

```
my-skill/
├── SKILL.md
└── scripts/
    └── index.html
```

Skills can be loaded by URL directly from this repo using the GitHub raw content URL.

---

*Built by STA Smart Homes — [stasmarthomes.co.uk](https://stasmarthomes.co.uk)*
