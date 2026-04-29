# Tier 1 Shims

The next batch of Shopify filters and tags to shim, ranked by usage in a real
production theme (315 `.liquid` files). Knocking these out closes the largest
call-site gaps without taking on the harder runtime-state items (money variants,
metafield rendering, etc.) that depend on object data.

Run `npm run docs:lookup <kind> <name>` to see the official spec, signature, and
rendered examples (when available) before authoring.

## Filters

| Filter                | uses | Shape             | Notes                                                                                       |
| --------------------- | ---: | ----------------- | ------------------------------------------------------------------------------------------- |
| `stylesheet_tag`      |  275 | wrap in `<link>`  | Takes a URL → `<link rel="stylesheet" href="...">`. Optional `media`, `preload` parameters. |
| `image_tag`           |  219 | wrap in `<img>`   | Takes the output of `image_url` → `<img>` with `srcset`/`width`/`height`/etc.               |
| `video_tag`           |  105 | wrap in `<video>` | Similar shape to `image_tag` for video media.                                               |
| `handleize`           |   78 | pure string       | Slugify: `Health Potion` → `health-potion`. **Aliased as `handle`** — register both.        |
| `placeholder_svg_tag` |   63 | return SVG        | Returns a static placeholder SVG by name (`product-1`, `collection-2`, `image`, etc.).      |

Together: ~740 call sites.

## Tags

| Tag        | uses | Shape                                   | Notes                                                                                                                 |
| ---------- | ---: | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `style`    |   87 | block → `<style>…</style>`              | Output the body wrapped in a `<style>` tag. Real Shopify adds `data-shopify`; for tests we can skip it or include it. |
| `doc`      |   37 | block → no-op                           | LiquidDoc comments. Use the `noOpBlock("doc")` helper (already exists at `src/shims/tags/shared/no-op.ts`).           |
| `paginate` |   35 | block → passthrough + `paginate` object | Renders body content; needs to expose a `paginate` drop with `current_page`, `pages`, `next`, `previous`, etc.        |
| `form`     |   33 | block → `<form>` wrapper                | Wraps body in `<form>` with hidden inputs depending on the type (cart, contact, customer_login, etc.).                |

## Suggested order

1. **`handleize`** — pure string function, no helpers needed. Good to wire up
   the alias-registration pattern (`t` / `translate` was the only other case).
2. **`doc` tag** — trivial; reuse the existing `noOpBlock` helper.
3. **`style` tag** — block with passthrough, similar to `noOpBlock` but emits
   the body inside `<style>` tags.
4. **`stylesheet_tag`** — straightforward HTML-wrapping filter.
5. **`image_tag` / `video_tag`** — HTML-wrapping filters; `image_tag` consumes
   the output of `image_url` (already shimmed) so the data URL flows through.
6. **`placeholder_svg_tag`** — could hard-code a single placeholder SVG for all
   input names (the actual SVGs are large; a generic shape is fine for tests).
7. **`form` tag** — bigger lift; needs realistic `form` object behavior. May end
   up partial.
8. **`paginate` tag** — most complex; defers naturally if it becomes a slog.

## Helpful utilities

`es-toolkit` is already a runtime dependency. Reach for it before hand-rolling
string/number/array logic — it's bundled per-named-import so there's no weight
cost. A few likely fits for Tier 1:

- `kebabCase` from `es-toolkit/string` — close to `handleize`, though verify it
  matches Shopify's behavior (lowercase + non-alphanumeric → `-`, trim,
  collapse). May need a thin wrapper.
- `unescape` from `es-toolkit/string` — already used in scripts; useful if a
  shim ever needs to round-trip HTML entities.
- `clamp`, `round` from `es-toolkit/math` — handy for image dimension /
  color-component shims.

When the implementation is one or two lines without a clean library match (e.g.
`stylesheet_tag` is just template-literal HTML), inline it directly.

## Workflow per shim

For each item:

1. Read the spec: `npm run docs:lookup filter handleize`
2. Create `src/shims/{filters,tags}/<name>.ts` (default-export a `ShimFilter` or
   `ShimTag`).
3. Co-locate the test at `src/shims/{filters,tags}/<name>.test.ts`. Use the
   `liquid` tagged template for inline cases — drop a `.liquid` fixture only for
   shared/reusable templates. **Drive the test from `renderedExamples`** in the
   shopify-examples JSON when present: those `{ code, data, output }` triples
   come from Shopify's own docs, so they're the closest thing to a canonical
   spec we have. Add hand-written cases for edge behavior the docs don't cover.
4. **Extract shared logic when a second consumer appears.** Move shared
   implementations, helpers, types, or constants to
   `src/shims/{filters,tags}/shared/<helper>.ts` and import from each shim file.
   Don't pre-extract; wait for the second consumer. Likely Tier 1 candidates:
   `image_tag`/`video_tag`/`placeholder_svg_tag` may share a small
   HTML-attribute-builder helper; `image_tag` will reuse the existing
   `image_url` PIXEL constant if it produces real `<img>` tags.
5. Run `npm run verify` and `npm test`.

The barrel auto-regenerates on `npm run build` (or `npm run prebuild`), so no
manual index edits.
