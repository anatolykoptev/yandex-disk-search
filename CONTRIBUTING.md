# Contributing

Issues and pull requests are welcome.

## Build and test

Requires Node with npm.

```sh
npm install
npm run type-check   # tsc --noEmit
npm run lint         # eslint src/
npm test             # vitest run
npm run build        # esbuild bundle into dist/
npm run watch        # rebuild on change
```

Load the repository folder as an unpacked extension in `chrome://extensions/` to try a
change on a public Yandex Disk page. `dist/` is committed, so run `npm run build` and
include the result in your pull request. The repository has no CI workflow; run
type-check, lint and tests yourself before opening a pull request.

## Commits and pull requests

- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`), as in the
  history.
- Keep a pull request to one concern and describe what changed, why, and how you tested
  it using the template.
- Add or update unit tests under `src/__tests__/` for logic changes.
- Update [docs/INDEX.md](docs/INDEX.md) when you add or rename a document.

## Security

Report vulnerabilities as described in [SECURITY.md](SECURITY.md).
