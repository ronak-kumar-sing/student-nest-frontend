# Design record: Handbill

## Concept
The design is built around "Handbill": the offline photocopied "room available" notices taped near college gates with tear-off strips carrying the owner's phone number. The site borrows that single physical idea and keeps everything else quiet, structured, and disciplined.

In Indian university cities like Indore, Bhopal, and Pune, student rental housing operates through offline noticeboards and street light poles rather than high-commission broker offices. Students aged 18 to 24 look for rooms or PGs directly outside campus gates, prioritizing rent price and neighborhood proximity. The physical tear-off strip represents immediate, unmediated access to the property owner. Adapting this mechanic creates an intuitive, authentic interface that reflects how students actually find housing: scanning essentials quickly, pulling owner contact details directly, and skipping middleman fees or visual clutter.

## Colour tokens
The palette reflects physical paper notices and ballpoint ink. Slips of coloured photocopy paper indicate individual listings and their current status, rather than acting as decorative background washes.

| Token name | Light hex | Dark hex | Role |
| --- | --- | --- | --- |
| paper | #F3F4F1 | #14161B | Page background, cool photocopy grey-white, not cream |
| ink | #1A1D24 | #E9EBEF | Primary text and headings |
| ballpoint | #2340A8 | #8FA6FF | Primary actions, links, focus ring |
| marigold | #F6C445 | #5A3F05 | Coloured photocopy paper used only for handbill listing surfaces and status chips |
| pink-slip | #F4A6C0 | #5C1D33 | Coloured photocopy paper used only for handbill listing surfaces and status chips |
| mint-slip | #A8DCC9 | #144638 | Coloured photocopy paper used only for handbill listing surfaces and status chips |
| muted | #5B6170 | #9EA3B0 | Secondary text, captions, and subtle labels |
| hairline | #D5D8DE | #2B2F38 | Decorative borders and dividers |
| control-border | #7A808C | #6B7180 | Form control borders (meets 3:1 non-text contrast) |

Coloured photocopy slips (marigold, pink-slip, mint-slip) are strictly reserved for handbill listing surfaces and status chips; they are never applied as page backgrounds or gradient fills. In dark mode, slips maintain their distinct hues while darkening to ensure WCAG AA readability (the dark slips carry light ink text).

These tokens are mapped onto shadcn semantic tokens (`--background`, `--foreground`, `--primary`, `--ring`, `--border`, and related variables) in `src/app/globals.css`.

### Contrast

| Pair | Ratio | WCAG |
| --- | --- | --- |
| Light: ink #1A1D24 on paper #F3F4F1 | 15.28:1 | AA (and AAA) text |
| Light: muted #5B6170 on paper #F3F4F1 | 5.61:1 | AA text |
| Light: ballpoint #2340A8 on paper #F3F4F1 (links, focus ring) | 8.03:1 | AA text |
| Light: white on ballpoint #2340A8 (primary buttons) | 8.86:1 | AA text |
| Light: ink on marigold #F6C445 | 10.36:1 | AA text |
| Light: ink on pink-slip #F4A6C0 | 8.88:1 | AA text |
| Light: ink on mint-slip #A8DCC9 | 11.04:1 | AA text |
| Light: destructive #C5221F on paper | 5.25:1 | AA text |
| Light: control border #7A808C on paper (inputs) | 3.59:1 | AA non-text (1.4.11) |
| Dark: ink #E9EBEF on paper #14161B | 15.16:1 | AA (and AAA) text |
| Dark: muted #9EA3B0 on paper #14161B | 7.17:1 | AA text |
| Dark: ballpoint #8FA6FF on paper #14161B | 7.81:1 | AA text |
| Dark: paper #14161B on ballpoint #8FA6FF (primary buttons) | 7.81:1 | AA text |
| Dark: ink on marigold #5A3F05 | 8.19:1 | AA text |
| Dark: ink on pink-slip #5C1D33 | 10.48:1 | AA text |
| Dark: ink on mint-slip #144638 | 8.96:1 | AA text |
| Dark: destructive #FF6B6B on paper | 6.52:1 | AA text |
| Dark: control border #6B7180 on paper (inputs) | 3.70:1 | AA non-text (1.4.11) |

Measured with the WCAG 2.x relative-luminance formula. Muted text on a light slip fails (#5B6170 on marigold is 3.81:1), so text on slips is always ink. The hairline #D5D8DE (1.29:1 on paper) is used only for decorative dividers, never as the only boundary of a form control.

## Typography
Typography balances personality in headings with maximum readability on mobile screens.

- Headings: Bricolage Grotesque (variable font, set large and tight). Weight contrast serves as the primary expressive element across sections.
- Body and UI: Atkinson Hyperlegible Next. Chosen specifically for legibility on phones.

### Type scale
- 72px: Home hero primary headline ("Rooms near your college, straight from the owner")
- 44px: Prominent display headings and major page headers
- 28px: Section headings, dialog and sheet titles, room detail page titles
- 20px: Section subheadings, card titles, key listing rent highlights in list rows
- 16px: Base body text, form input fields, primary table and list details
- 14px: Captions, status chips, secondary metadata, helper text

### Typographic rules
- Body text line length must stay under 75 characters (75ch).
- No monospace labels or tags in standard UI.
- No all-caps eyebrows or uppercase tracked section labels.
- No accenting a single headline word with colour or italics.

## Layout
The layout uses a left-aligned structure with generous whitespace, a 12-column grid at desktop, and a single column on mobile, fully responsive down to 360px viewport widths.

### Home hero
The left side features the primary display headline ("Rooms near your college, straight from the owner") alongside the main search form (city, optional college or locality, budget). The right side displays three real listings from the API styled as physical handbills: slightly rotated paper slips in marigold, pink, and mint, each held with a pin graphic and terminating in a perforated tear-off strip reading "Contact owner". Small screens show one handbill below the search form.

### Search results (/rooms)
Results display as a vertical list rather than an identical grid of cards. Each row contains:
- Listing photograph on the left.
- Room title, locality, and key facts in the middle.
- Rent formatted as the largest, most prominent number in the block.
- Perforated tear-off strip on the right edge housing the "Contact owner / view" affordance. Only this action element uses the tear-off strip.

Search filters sit in a dedicated desktop sidebar and open inside a slide-out sheet on mobile devices. All filter states synchronize bidirectionally with URL query parameters.

### Room detail (/rooms/[id])
- Responsive photo gallery showcasing exterior and interior shots with unoptimized fallback handling.
- Prominent rent display block.
- Property facts formatted as an accessible definition list (`<dl>`, `<dt>`, `<dd>`).
- Available amenities displayed as plain text chips without decorative icons.
- Sticky application panel on desktop viewports providing immediate booking access.

## Motion
Motion is restrained to keep the interface utilitarian:
- Orchestrated moment: exactly one sequenced animation occurs on home page load. The three hero handbills are pinned in sequence with a short drop-and-settle and slight rotation. This animation is implemented purely with CSS keyframes and is completely disabled under `prefers-reduced-motion`.
- Functional transitions: interactive components (dialog opening, sheet sliding, button active press, tab switching) use quick, functional transitions only.
- Strict prohibitions: no scroll-triggered reveal animations, no entrance fades on scroll, and no hover lift on every card.

## Avoid list
The interface strictly avoids generic SaaS and landing page clichés:
- No purple or blue linear or radial gradients.
- No frosted glass or glassmorphism effects.
- No emoji used as interface icons or badges.
- No identical three-card feature grids ("Why choose us").
- No fake testimonials or fabricated student reviews.
- No fake stats, listing counts, or inflated user numbers.
- No directional arrows ("→") appended to button copy.
- No middle-dot meta strings separating listing metadata (use spacing or commas).
- All icons come strictly from Remix Icon (`@remixicon/react`).

## Components and libraries
- shadcn/ui built on Base UI primitives: Dialog, Sheet, Input, Select, Checkbox, Textarea, and Sonner toasts.
- TanStack Query: client data fetching, caching, and server state management.
- Prohibited dependencies: GSAP, Three.js, Motion (Framer Motion), or other third-party motion libraries.

## Copywriting
Interface copy is direct, specific, and written in sentence case for students:
- Call to action buttons describe the exact resulting operation: "Send code", "Verify and continue", "Save room", "Apply to book".
- Error messages state what happened and what specific action to take next.
- Empty states give clear context and invite the immediate next step (for example: "No saved rooms yet. Browse rooms in Indore.").
- No marketing hyperbole and never invent facts about properties, colleges, or user stats.

## Accessibility
- Landmarks: semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`, `<section>`).
- Form controls: explicitly associated labels for all inputs, selects, and checkboxes.
- Focus states: visible ballpoint focus ring on all interactive elements.
- Keyboard navigation: fully operable filter sheets, dialogs, dropdowns, and pagination.
- Alternative text: informative image alt text derived directly from listing titles and room categories.
- Reduced motion: all CSS animations and transitions strictly respect `prefers-reduced-motion: reduce`.
- Colour contrast: all text-to-background combinations meet or exceed WCAG AA requirements (4.5:1 for normal text, 3:1 for large text).

## Component states
Every data-driven view provides three distinct states:
1. Loading state: skeleton placeholders preserving layout stability without layout shifts.
2. Empty state: clear, non-punitive messaging offering a relevant forward action.
3. Error state: human-readable explanation of the issue with an explicit "Try again" retry action.

## Rejected alternative: Campus map
An earlier design concept explored a map-first layout ("Campus map") featuring deep teal and signal yellow accents, where listings were plotted and ranked primarily by walking distance to a selected college campus.

This approach was rejected for three key reasons:
1. Dependency on external map tile providers and API keys creates unnecessary runtime fragility and licensing friction.
2. Students scan rentals price-first and amenity-first; an expansive interactive map pushes crucial rental facts below the fold.
3. Map-heavy rental interfaces look identical to conventional travel and booking portals, diluting the authentic, broker-free character of the handbill concept.
