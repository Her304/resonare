# Resonare — Design Reference

Source: [Claude Design handoff](https://claude.ai/design/p/7b71d080-0773-4d46-992f-57a431abf94e?file=Resonare.dc.html)

Refined into a structured "concert atlas" aesthetic — progress rings, milestone stat cards,
stamp-style entries, a boarding-pass detail view, and a floating glass nav.

---

## Phone frame

`430px` wide, height `min(860px, calc(100dvh - 72px))` so the whole phone (nav included) always
fits the viewport. Border-radius 40px, `#0F5E5E` background, `1px solid rgba(242,236,224,0.14)`
border, soft tinted drop shadow. `overflow: hidden` with an absolutely-positioned scroll layer
(`.phone-scroll`) inside and the nav overlaid on top.

Page background: radial gradient `radial-gradient(120% 90% at 50% 0%, #0F5E5E 0%, #082F2F 55%, #061f1f 100%)`.
A fixed grain overlay (`.r-grain`, SVG fractal noise, `opacity 0.05`, `mix-blend-mode: overlay`)
sits above the content to break up flat color fields.

---

## Color palette

| Token | Hex | Usage |
|---|---|---|
| `deep-teal` | `#082F2F` | Page / outer background base |
| `mid-teal` | `#0F5E5E` | Phone shell, card surface |
| `cream` | `#F2ECE0` | Light cards, primary text on dark |
| `ink` | `#1a1816` | Text on light surfaces |
| `muted` | `#8f8a85` | Secondary text (venue, date) |
| `orange` | `#FF6B35` | FAB, CTA, progress ring/bar, favorite star, active dots |
| `lime` | `#D4E157` | "the memory" label accent |
| `cream-dim` | `rgba(242,236,224,0.6)` | Subdued labels on dark |
| `teal-border` | `rgba(15,94,94,0.16)` | Card borders on light bg |
| `glass-teal` | `rgba(11,66,66,0.5)` | Nav pill background (with backdrop blur) |
| Spotify color | `hsl({hue}, 42%, 32%)` | Album art placeholder squares |

---

## Typography

| Font | Weights | Usage |
|---|---|---|
| Noto Serif JP | 500, 600, 700 | Brand wordmark, artist names, headings, stat numbers, quote text |
| Inter | 400, 500, 600, 700 | All UI labels, inputs, metadata |

Fonts are referenced via the `next/font` CSS variables (`var(--font-noto-serif-jp)`,
`var(--font-inter)`) so they resolve to the actual loaded faces.

---

## Iconography

Custom inline SVG icon set (stroke width `1.6–1.7`, rounded caps) — no icon library dependency.
Includes: home, user, star (fill toggles favorite), search, chevron left/right, ticket, camera,
music note, pen. Step icons (ticket → camera → music → pen) label the log flow.

---

## Shared components

### ImageSlot
Placeholder tile — `rgba(242,236,224,0.08)` bg, `1px dashed rgba(242,236,224,0.2)` border, centered
icon + label. Accepts `onFile` to open the file picker and display the upload via `FileReader`.

### StatRing
Circular SVG progress ring — `rgba(26,24,22,0.12)` track, orange progress stroke (rounded cap,
`0.5s` ease transition), value centered in bold serif. Used on Home (shows vs. goal) and Profile
(favorites vs. total).

### MiniStat
Compact cream stat card — uppercase label, bold serif value, optional sub-line and an optional
orange progress bar. Used in the milestone rows.

### BottomNav
Floating, fixed to the frame bottom. **No bar background** — two free-floating elements:
- **Glass pill** (left) holding the `home` / `profile` tabs: `rgba(11,66,66,0.5)` +
  `backdrop-filter: blur(18px) saturate(1.3)`, light border, inner-highlight shadow. Tabs are
  `48px` tall (matching the FAB), active tab is a solid cream chip, inactive is `0.55` opacity.
- **`+` FAB** (right): `56px` orange circle, coral drop shadow.

---

## Screens

### Home

- Header: wordmark left (`26px` bold serif) + `stamped in, played out` tagline right
- **Atlas card**: `StatRing` (shows vs. next goal) + "{n} of {goal} shows logged" and
  "{artists} artists · {cities} cities explored"; elevated with a tinted shadow
- **Recently stamped** callout: latest show, star badge, opens detail
- **Search** pill (cream, blur) filtering artist/venue
- **Filter pills**: `all` / `{year}` / `favorites` (active = cream chip)
- Concert cards: `#F2ECE0`, 20px radius, row layout
  - Ticket slot `64 × 88px`, artist `18px` bold serif + city tag pill
  - Venue · date (`prettyDate`, e.g. "Mar 14, 2026"), Spotify badge, italic comment
  - Favorite star toggle (top-right)
- Empty state when no shows match the search/filter

> Note: the shows / artists / cities **milestone row lives on Profile**, not Home.

### Profile

- Header: orange avatar tile + "your resonare year"
- **Favorites ring card**: `StatRing` (favorited vs. total) + photo count
- **Milestones row**: shows (with goal progress) · artists · cities
- **Quick stats row**: photos · favorites · top artist
- **Stamps grid**: 2-column dashed-border "stamp" cards (artist, city, date; favorite marker), tap to open detail
- **Your data**: `export` (download JSON) · `import` (load JSON, inline error on bad file) ·
  `reset` (tap-to-confirm, reverts to seed)

### Log Concert (4 steps)

Step indicator: 4 `3px` bars, orange when ≤ current step. Each step title is prefixed with its icon badge.

| Step | Title | Content |
|---|---|---|
| 1 | the show | Artist input (24px bold serif), venue input, date picker — transparent, cream bottom border; ticket photo slot `100% × 170px` |
| 2 | the memories | 3-column grid, 9 slots, camera-icon placeholders |
| 3 | the soundtrack | Selected-track banner (pink tint), search pill, result rows (`40 × 40px` swatch + name/type) |
| 4 | the feeling | Textarea (cream, serif) + review summary card |

Bottom gradient CTA: `linear-gradient(to top, #0F5E5E 60%, transparent)`, orange pill (`next` / `log it`).

### Concert Detail — boarding pass

- Top row: back chevron · `concert pass` label · favorite star toggle
- Ticket image `100% × 190px`, 18px radius
- Artist `27px` bold serif + rotated `stamped` badge (coral outline)
- **Boarding-pass stat strip**: two columns (soundtrack / memories count) split by a divider, with a
  dashed "barcode" strip along the bottom
- Spotify card (`52 × 52px` swatch)
- Photos: 3-column grid
- **the memory**: comment in a dashed card with a lime uppercase label

---

## Interaction & polish

- **`.r-pressable`** — `transform: scale(0.96)` + slight fade on `:active` for physical press feedback
  (all tappable elements: cards, tabs, FAB, filter pills, list rows).
- **`.r-input`** — visible coral focus ring on `:focus-visible` only (keyboard), suppressed for pointer.
- Active nav tab, filter pills, and step bars all use smooth `~0.2s` transitions.
- Dates are humanized via `prettyDate`; city derived from venue via `cityFromVenue`.

---

## Implementation

- **Framework**: Next.js 14 App Router + TypeScript
- **Styling**: inline styles (pixel-exact) + a small `globals.css` for resets, grain, press/focus states
- **Fonts**: `next/font/google` (Noto Serif JP 500/600/700, Inter 400/500/600/700), used via CSS variables
- **State**: single `Resonare` client component — `useState` for screen/draft/concerts/selection;
  favorites toggle, and import/reset rewrite the concert list in place
- **Data**: seed concerts in-memory; export/import round-trips the list as JSON (normalized & validated on import)
- **Entry**: `app/page.tsx` → `components/Resonare.tsx`
