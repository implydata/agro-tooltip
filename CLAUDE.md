# CLAUDE.md

A tiny, dependency free mouse-following tooltip for elements with a `data-tooltip` attribute. Published to npm as `agro-tooltip`. "Agro" means aggressive: it shows up immediately, unlike the native `title` tooltip.

## Commands

Node is pinned in `.node-version`, managed by mise.

- `npm run build`: `tsc -p tsconfig.dist.json` emits types to `dist/`, then tsup bundles ESM (`index.mjs`), CommonJS (`index.js`) and the `<script>` global `agroTooltip` (`agro-tooltip.global.js`), and copies `src/agro-tooltip.css` to `dist/`
- `npm test`: builds, then type checks, runs eslint, the prettier check and jest (jsdom). This is the full gate.

## Conventions

- Every source file needs the Apache 2.0 license header (enforced by eslint `notice/notice`).
- The CSS ships as plain CSS (no Sass) and every visual value is a `--agro-tooltip-*` custom property with a default. Keep it that way, and keep the README table of properties in sync.
- The published package has no runtime dependencies. Keep it that way.
- User-facing changes need a changeset: a file in `.changeset/` with `'agro-tooltip': patch|minor|major` and a one-line summary. Releases go through the changesets GitHub action.
