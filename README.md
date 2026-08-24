# Christian Galeno — Data Scientist Portfolio

A single-page portfolio built with plain HTML, CSS, and vanilla JavaScript. No
frameworks, no build step, no dependencies — open `index.html` and it runs.

**Live:** https://christiangaleno.github.io/Christian_Galeno/

## Structure

```
index.html          Markup for every section (hero, about, skills, projects, education, contact)
css/styles.css      All styling; theming is driven by custom properties on :root and [data-theme="dark"]
css/noscript.css    Fallback loaded only when JavaScript is disabled
js/theme.js         Applies the saved/system theme before first paint (no defer — must run early)
js/main.js          Scroll reveals, scroll-spy nav, theme toggle, mobile menu, stat counters
assets/             Profile photo and the SVG favicon
```

## Running locally

Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` also works, though the
Content-Security-Policy meta tag behaves more like production over HTTP.

## Theming

Colours live as custom properties in `css/styles.css`. `:root` holds the light
palette; `[data-theme="dark"]` overrides only the tokens that change. To adjust
a colour, edit the token rather than the rule that uses it — several components
share the same token.

Theme resolution order: saved `localStorage` choice → OS `prefers-color-scheme`
→ light. `js/theme.js` runs in `<head>` without `defer` so the correct theme is
applied before the first paint.

## Accessibility notes

- Text colours are checked against WCAG AA (4.5:1) in both themes.
- The mobile menu traps focus, closes on `Escape` or an outside click, and
  returns focus to the toggle.
- All motion is disabled under `prefers-reduced-motion: reduce`.
- With JavaScript disabled, `css/noscript.css` keeps the content visible.

## Deploying

Served as static files from the repository root. If the site moves off GitHub
Pages, update `og:url`, `og:image`, and `<link rel="canonical">` in
`index.html`.

## License

MIT — see [LICENSE](LICENSE).
