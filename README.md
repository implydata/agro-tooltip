# agro-tooltip

A tiny, dependency free tooltip that follows the mouse. Put a `data-tooltip` attribute on any element and its text shows up next to the pointer.

**Why "agro"?** It is short for _aggressive_: the tooltip appears **immediately** on hover, unlike the browser's native `title` tooltip, which waits about a second before it shows up (and cannot be styled). That makes it good for dense UIs such as charts, tables and toolbars, where people move fast and want to read what they are pointing at.

- One listener on the document, so it works for elements added at any time (React, Vue, plain DOM, ...)
- The tooltip of an element applies to all of its descendants
- Text only (set with `textContent`, never parsed as HTML); `\n` makes a new line
- Stays inside the window
- Under 2 KB minified, no dependencies
- Usable from TypeScript, JavaScript (ESM or CommonJS), or a plain `<script>` tag

## Install

```sh
npm install agro-tooltip
```

## Use

### With a bundler (TypeScript or JavaScript)

```ts
import { initAgroTooltip } from 'agro-tooltip';
import 'agro-tooltip/agro-tooltip.css';

initAgroTooltip();
```

Call it once, when your app starts. If your bundler does not handle CSS imports, link `node_modules/agro-tooltip/dist/agro-tooltip.css` in another way, or copy its one rule into your own stylesheet.

### In a plain HTML page (no build step)

```html
<link rel="stylesheet" href="https://unpkg.com/agro-tooltip@0/dist/agro-tooltip.css" />
<script src="https://unpkg.com/agro-tooltip@0"></script>
<script>
  agroTooltip.initAgroTooltip();
</script>
```

The script defines a single `agroTooltip` global. jsDelivr works too: `https://cdn.jsdelivr.net/npm/agro-tooltip@0`.

### Then, in your markup

```html
<button data-tooltip="Delete the selected rows">Delete</button>

<td data-tooltip="Line one&#10;Line two">Hover for two lines</td>
```

In React: `<span data-tooltip={fullName}>{shortName}</span>`. An empty attribute counts as no tooltip, so `data-tooltip={isTruncated ? text : undefined}` (or `''`) turns it off.

## Options

`initAgroTooltip(options?)` takes an optional object:

| Option      | Default          | Description                                                                                                                                                                                                                                                           |
| ----------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attribute` | `'data-tooltip'` | The attribute that holds the tooltip text.                                                                                                                                                                                                                            |
| `container` | `document.body`  | Where the tooltip element is appended: an element, a CSS selector, or a function returning an element. It is looked up each time a tooltip appears, so it can point at something that does not exist yet. If it finds nothing, the tooltip goes into `document.body`. |
| `className` | `'agro-tooltip'` | The class on the tooltip element. Change it if you would rather style the tooltip yourself than use the stylesheet.                                                                                                                                                   |
| `offsetX`   | `0`              | Horizontal distance from the pointer, in pixels.                                                                                                                                                                                                                      |
| `offsetY`   | `30`             | Vertical distance from the pointer, in pixels (below the cursor, so the cursor does not cover the text).                                                                                                                                                              |
| `document`  | `document`       | The document to listen on, for example an iframe's.                                                                                                                                                                                                                   |

It returns a function that stops the tooltip and removes it if it is showing:

```ts
const stop = initAgroTooltip({ container: '.radix-themes', offsetY: 20 });
// later
stop();
```

The package also exports `positionAgroTooltip(element, clientX, clientY, offsetX?, offsetY?)`, which places any `position: fixed` element by the pointer, kept inside the window, in case you want the same placement for a tooltip of your own.

## Styling

`agro-tooltip.css` is a single rule for `.agro-tooltip`. Everything about the look is a CSS custom property with a default, so you can restyle it without fighting specificity:

| Property                       | Default   |
| ------------------------------ | --------- |
| `--agro-tooltip-background`    | `#1c2127` |
| `--agro-tooltip-color`         | `#f6f7f9` |
| `--agro-tooltip-font-family`   | `inherit` |
| `--agro-tooltip-font-size`     | `11px`    |
| `--agro-tooltip-line-height`   | `normal`  |
| `--agro-tooltip-padding`       | `5px 8px` |
| `--agro-tooltip-border-radius` | `4px`     |
| `--agro-tooltip-max-width`     | `75vw`    |
| `--agro-tooltip-z-index`       | `1000`    |

```css
:root {
  --agro-tooltip-background: #312e81;
  --agro-tooltip-font-size: 13px;
}
```

Custom properties inherit from the tooltip's **container**, which is why `container` exists. For example, to match [Radix Themes](https://www.radix-ui.com/themes) tooltips (including dark mode), append the tooltip inside the theme and map the properties to the theme's tokens:

```ts
initAgroTooltip({ container: '.radix-themes' });
```

```css
.radix-themes {
  --agro-tooltip-background: var(--gray-12);
  --agro-tooltip-color: var(--gray-1);
  --agro-tooltip-padding: var(--space-1) var(--space-2);
  --agro-tooltip-border-radius: var(--radius-2);
  --agro-tooltip-font-size: var(--font-size-1);
  --agro-tooltip-line-height: var(--line-height-1);
}
```

The script sets `position: fixed` and `pointer-events: none` on the element itself, so the tooltip never gets in the way of the mouse, even before the stylesheet loads.

## Example

[`examples/index.html`](examples/index.html) is a plain page that uses the local build. Run `npm run build`, then open it in a browser.

## Development

- `npm run build`: emits types with `tsc` and bundles ESM, CommonJS and the `<script>` global to `dist/` with tsup
- `npm test`: builds, type checks, lints, checks formatting, and runs the jest tests (jsdom)

Releases use [changesets](https://github.com/changesets/changesets). A change that users can see needs a changeset: run `npx changeset` (or add a file to `.changeset/`) and commit it with the change. When that lands on `master`, the Release workflow opens a "Version Packages" pull request, and merging that pull request publishes to npm.

## License

[Apache 2.0](LICENSE)
