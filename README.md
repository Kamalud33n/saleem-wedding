# Wedding Invitation — Envelope Edition

An animated, single-page wedding invitation built with **Next.js (App Router)**,
**JavaScript**, **Tailwind CSS v4**, and **Framer Motion**.

The centerpiece is the intro: guests tap a wax seal, it cracks open, the
envelope flap folds back in 3D, and the invitation card slides out before the
full site is revealed.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Customize everything from one file

All wedding-specific content — names, dates, venues, the RSVP poll, the
footer — lives in **`config/wedding.config.js`**. Edit that file only; the
components read from it, so a content change never touches component code.

## Add your own photos

Drop image files into `public/gallery/` and swap the placeholder cards in
`components/OurStory.js` for `<Image src="/gallery/yourfile.jpg" ... />`
using `next/image`. The gallery ships with elegant empty-state placeholders
so the layout looks complete before you add photos.

## Wiring up real data collection

Both interactive forms are intentionally front-end only right now, so the
project runs anywhere with zero setup:

- **RSVP** (`components/RSVP.js`) — confirms locally on submit.
- **Guestbook** (`components/Guestbook.js`) — notes live only in the
  current browser tab and reset on refresh; they are not shared between
  guests.

To actually collect responses, wire `handleSubmit` in either component to
one of:
- A [Formspree](https://formspree.io) or [Getform](https://getform.io) endpoint (no backend needed)
- A Next.js [Route Handler](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) that writes to a database (Supabase, Firebase, Google Sheets API)

## Project structure

```
app/                  Root layout, global styles, the single page
components/
  Envelope.js          The signature seal + envelope-opening animation
  Hero.js              Couple names, invitation line
  Countdown.js          Live countdown to the wedding date
  OurStory.js           Photo gallery (placeholder cards)
  Ceremonies.js         Nikkah ceremony details
  RSVP.js                Guest details + fun poll form
  Guestbook.js           Wish / advice wall
  Footer.js
config/
  wedding.config.js      <- edit this for a new couple
```

## Tech notes

- Tailwind v4 uses CSS-based config (`app/globals.css` `@theme` block) —
  there's no `tailwind.config.js`. Colors: `peacock`, `marigold`,
  `vermilion`, `parchment`, `betel`, `ink`.
- Reduced-motion is respected globally (see the `prefers-reduced-motion`
  block in `globals.css`).
- The envelope overlay marks the page content `inert` until opened, so
  screen readers and keyboard tabbing skip straight past it.
