# Bib Generator

Generate race bibs from CSV files.

## Setup

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

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


