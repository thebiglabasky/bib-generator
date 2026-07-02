# Bib Generator

Generate race bibs from CSV files.

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Monitoring

Checkly is configured in `checkly.config.ts` with checks in `__checks__/`.
Set `BIB_GENERATOR_BASE_URL` to the public deployment URL before running or deploying checks:

```bash
npx checkly env add BIB_GENERATOR_BASE_URL https://your-public-app-url.example
pnpm checkly:test --list
pnpm checkly:test
pnpm checkly:deploy
```

The current setup monitors the homepage, race configuration route, and template designer route, plus browser flows for CSV import and template preview rendering.

## Usage

1. **Upload CSV** - semi-colon delimited CSV
2. **Map columns** - select which columns contain family name, adult name, child name, birth year, etc.
3. **Configure races** - set year ranges and tag colors
4. **Generate** - opens print page with all bibs

## Customizing Bib Template

Edit `components/BibTemplate.tsx` to change:
- Layout, fonts, colors
- Background gradients
- Size and positioning
- Add logos or images

The component uses CSS-in-JS (styled-jsx) for easy inline styling.
