# justin.wen

My personal website. It's plain HTML, CSS, and JavaScript with no build step.

```
index.html       content and structure
styles.css       design tokens (light/dark), layout, components
main.js          theme toggle, scroll reveals, live GitHub details
assets/          favicon (and an optional workspace photo)
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Content

- Text comes from my [GitHub profile README](https://github.com/justinwen4/justinwen4) and repo READMEs, and is written directly into `index.html`.
- `main.js` makes unauthenticated calls to the public GitHub API to add star counts, "updated X ago" lines (for any card with `data-repo="<repo>"`), and the latest push in the "Right now" card. Results are cached in `sessionStorage` for 30 minutes. If the API fails or hits its rate limit, the page still shows all of its static content.
- **Workspace photo:** save a photo as `assets/workspace.jpg`. In `styles.css`, set `--photo: url("assets/workspace.jpg");` on `.photo`, then delete the `.photo-term` placeholder in `index.html`. The photo is shown in grayscale automatically.

## Deploy

Any static host works:

- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
- **Vercel / Netlify:** import the repo with no framework and no build command.
