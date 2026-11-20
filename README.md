# Running With Wolves — website

Premium endurance-coaching site (Dutch only) built from the RWW build brief.
Static HTML, CSS and vanilla JavaScript on Vite. Every page is a single `.html`
file directly in this folder — no subfolders for pages, styles or images.

## Bekijken

Er is geen build nodig: elk bestand staat plat in deze map en de stylesheet is
een gewone `<link>`, dus je kunt de map zo op elke statische host zetten of
lokaal serveren:

```sh
python3 -m http.server 8000
```

Voor ontwikkeling met live reload:

```sh
npm install
npm run dev
```

`bun install && bun run dev` werkt ook. Bouwen kan met `npm run build` (output in
`dist/`), previewen met `npm run preview`.

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| Coaching | `coaching.html` |
| Triathlon & Ironman | `coaching-triathlon-ironman.html` |
| (Halve) marathon | `coaching-marathon.html` |
| Ultra | `coaching-ultra.html` |
| Werkwijze | `werkwijze.html` |
| Resultaten | `resultaten.html` |
| Over ons | `over-ons.html` |
| Kennis | `kennis.html` |
| Artikel — rustige duurlopen | `kennis-rustige-duurlopen.html` |
| Artikel — fuelling | `kennis-fuelling-per-uur.html` |
| Artikel — kracht | `kennis-kracht-voor-lopers.html` |
| Contact | `contact.html` |
| Intake (niet in het menu) | `intake.html` |
| Intake bedankt | `intake-bedankt.html` |
| Juridisch | `privacy.html`, `cookies.html`, `algemene-voorwaarden.html` |

All internal links are relative (`coaching.html`, `intake.html`), so the site
also works from a subdirectory. `vite.config.js` picks up every `.html` file in
this folder — no page needs registering.

## Editing copy

Open the page file and edit the text between the tags. Class names describe the
role (`hero`, `section--bone`, `case-feature`, `pull-quote`, …); leave them alone
and the design keeps working. All Dutch copy came from the brief and should be
used word for word.

### Adding a case card

Copy one `<article class="case-card" data-case="marathon">` block on
`resultaten.html`. `data-case` accepts `marathon`, `triathlon` or `eerste` (the
filter chips above the grid use those values). The big number is live text, not
an image — update `.result-card__big`.

### Adding a blog post

Copy `kennis-rustige-duurlopen.html` to `kennis-<nieuwe-slug>.html`, change the
copy and title, then add a `<a class="post-card" href="kennis-<nieuwe-slug>.html" data-case="training">`
card on `kennis.html`. Migrate older posts the same way and keep their old URLs
working with 301 redirects at the host. Add new pages to `sitemap.xml`.

### The 360° wheel

The wheel is inline SVG, generated in `main.js` (`buildWheelSvg`) so the labels
stay sharp and the animation runs. The text per pillar lives in the page itself:
inside `[data-wheel-copy]`, one `[data-pillar]` per pillar. Change the copy there;
the wheel, the desktop panel and the mobile accordion all read from it. The
animation respects `prefers-reduced-motion`.

## Swapping photos and video

Every image sits in this folder next to the HTML. The current files are **graded
placeholders** generated in the RWW palette — replace each file with the real
photo of the same name (or re-run `node make-placeholders.mjs`) and no layout
changes are needed:

- `hero-home.svg`, `hero-triathlon.svg`, `hero-marathon.svg`, `hero-ultra.svg`, `hero-coaching.svg`, `about-hero.svg`
- `portrait-ruben.svg`, `story-ruben.svg`, `race-haarlem.svg`, `training-workout.svg`, `ultra-ruben.svg`
- `tile-triathlon.svg`, `tile-marathon.svg`, `tile-ultra.svg`
- `poster-1.svg` … `poster-4.svg` (testimonial posters)
- `favicon.svg`

Keep the treatment consistent: saturation −20%, warm grade, shadows towards
`#3B2416`, highlights towards `#F8F4EC`. Export as WebP or AVIF, lazy-load
everything below the fold.

Testimonial videos: add a URL to `data-src` on a `.video-tile` (or `.video-wide`)
and the tile becomes playable with sound and controls. Host the MP4 on Vimeo,
Bunny Stream or the site platform — never embed from Drive.

For the hero: add a `<video>` in `.hero__media` with `autoplay muted loop
playsinline` and a `poster`, and the existing image stays as the still fallback.

## Site configuration

`config.js` holds everything that still needs a real value:

```js
ga4Id, clarityId, metaPixelId   // analytics, only loaded after consent
formEndpoint                    // GoHighLevel webhook for the contact form + tag website-contact
ghlCalendarId                   // 'runningwithwolvesintake15'
whatsappNumber                  // leave empty to hide the WhatsApp links
instagramUrl, webshopUrl
```

The intake calendar is embedded from GoHighLevel on `intake.html`. UTM parameters
are carried from the ad click, stored for the session and appended to every
`intake.html` link and to the calendar iframe, so campaigns stay attributable.

Tracking events are wired and fire only after cookie consent: `PageView` on all
pages, `ViewContent` on the sport pages, `werkwijze.html`, `resultaten.html`,
`Lead` on the contact form, `Schedule` on `intake-bedankt.html`.

## Before launch

- Real photography and testimonial videos from the shared Drive folder.
- GoHighLevel booking link, intake duration, contact form endpoint.
- GA4, Clarity and Meta Pixel IDs.
- WhatsApp number and the existing webshop URL.
- Legal texts (privacy, cookies, terms) — the current pages are marked as concepts.
- Athlete consent, coach names/photos, Google Business profile.
- 301 redirects for all current URLs and old blog posts (old paths → the flat
  `.html` files).

## Publish

The production build lands in `dist/`. `deploy.json` serves it through the
Cloudflare `ASSETS` binding (`worker.js`), so `sites_deploy` with that manifest is
all that is needed when publishing is approved.
