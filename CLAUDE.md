# yandex-disk-search — notes for coding agents

A Chrome Manifest V3 content-script extension that adds a search bar to public
Yandex Disk pages (`*://disk.yandex.ru/*`). TypeScript, bundled by esbuild into one
IIFE. User overview in [README.md](README.md); every document is listed in
[docs/INDEX.md](docs/INDEX.md).

## Layout

- `src/content.ts` entry; `src/services/` (`state`, `filter`, `harvester`,
  `copy-handler`), `src/ui/search-bar.ts`, `src/utils/`, `src/constants/config.ts`
  (selectors for the Yandex Disk DOM, timeouts), `src/types/`.
- `manifest.json` loads `dist/content.js` and `dist/content.css`; `_locales/` holds the
  `ru` (default) and `en` strings.
- `dist/` is the committed build output that Chrome loads; `content.js` and `styles.css`
  at the repository root are the pre-TypeScript version (v2.2.0 header), not loaded by `manifest.json`.

## Gate

There is no CI workflow. Before a pull request:

```sh
npm run type-check   # tsc --noEmit
npm run lint         # eslint src/
npm test             # vitest run (20 tests: filter and state)
npm run build        # regenerates dist/, commit the result
```

## Invariants easy to break

- Rebuild and commit `dist/` after any change in `src/`; the extension loads `dist/`,
  not `src/`.
- The DOM selectors in `src/constants/config.ts` depend on Yandex Disk's markup and are
  the first thing to check when the extension stops finding files.
- The version appears in `manifest.json`, `package.json` and `CONFIG.version`; keep
  them equal (they are currently out of step, see CHANGELOG).
- Permissions stay minimal: `activeTab` and the `disk.yandex.ru` host only.
