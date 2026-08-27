# Aurora — Demo Site

A small, dependency-free demo website: a single-page layout with a hero,
features grid, "how it works" steps, and a contact form — plus a light/dark
theme toggle.

No build step, no frameworks. Just:

- `index.html`
- `styles.css`
- `script.js`

## Run it locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Works as-is on GitHub Pages, Netlify, or Vercel — no build command needed.

### GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Pages** and set the source to the `main`
   branch, root folder.
3. Your site will be live at `https://<username>.github.io/<repo>/`.
