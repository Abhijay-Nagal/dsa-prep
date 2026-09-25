# docs

| File | What it is |
|---|---|
| `DSA-Prep-User-Guide.pdf` | The user guide. Five A4 pages: setup, the daily loop, working problems, tools and shortcuts, data and routine. |
| `user-guide.html` | The source the PDF is rendered from. Edit this, never the PDF. |

## Regenerating the PDF

Rendered with headless Chrome, so there is no toolchain to install.

```bash
chrome --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="docs/DSA-Prep-User-Guide.pdf" \
  "file:///<absolute path>/docs/user-guide.html"
```

On Windows the binary is at `C:\Program Files\Google\Chrome\Application\chrome.exe`, and the `file:///` URL must be
absolute. `--no-pdf-header-footer` is what removes Chrome's own date and URL strip.

## Keeping it to five pages

Each `<section class="page">` is one printed page. The A4 printable box with the margins in the stylesheet is
**688 × 1013 px** at 96dpi, so a section taller than 1013px silently spills onto an extra page.

To check before rendering, open `user-guide.html` with the body constrained to 688px and measure each section:

```js
const limit = (297 - 15 - 14) * 96 / 25.4;            // 1013px
document.querySelectorAll(".page").forEach((s, i) =>
  console.log(i + 1, s.getBoundingClientRect().height, "slack", limit - s.getBoundingClientRect().height));
```

Every section currently has 149–286px of slack. If you add a block and one goes negative, move a whole `<h2>` section
to a neighbouring page rather than shrinking type.

Footers carry a label (`Setup and first run`, `The daily loop`, …) instead of a page number, precisely so that adding a
paragraph cannot make the numbering wrong.
