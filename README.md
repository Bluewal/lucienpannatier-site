# lucienpannatier.ch

Personal site - IT & Security Lead / Blue Team, with a photography gallery.
Built with Astro (static output). Terminal / Blue Team aesthetic.

## Develop
```bash
npm install
npm run dev        # http://localhost:4321
```

## Build
```bash
npm run build      # -> dist/
```

## Deploy on Cloudflare Pages
1. Push this repo to GitHub.
2. Cloudflare Pages -> Create project -> connect the repo.
3. Framework preset: **Astro**. Build command `npm run build`, output dir `dist`.
4. Add custom domain `lucienpannatier.ch` (repoint DNS from Adobe to Cloudflare).

## Structure
- `src/albums/<slug>/*.jpg` - source photos (one folder per album). EXIF already stripped.
- `src/data/albums.js` - album slugs + display titles.
- `src/pages/index.astro` - the one-pager (hero, about, skills, career, credentials, projects, photography, contact).
- `src/pages/albums/[slug].astro` - per-album gallery with lightbox.
- Images are optimised at build (AVIF/WebP, responsive) by Astro's asset pipeline.

## Add / change photos
Drop images into `src/albums/<slug>/`, add the album to `src/data/albums.js` if new, rebuild.
