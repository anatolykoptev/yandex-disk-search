# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- Apache-2.0 licence file added (July 2026). `package.json` still declares MIT; the
  two should be reconciled by the owner.

## 2.3.0 - 2026-01-25

### Changed
- Styles moved to a separate `content.css`.
- Migrated to TypeScript with a modular layout (services, UI, utilities); ESLint and
  20 Vitest unit tests added. `manifest.json` and `CONFIG.version` say 2.3.0 while
  `package.json` still says 2.2.6.

## 2.2.6 - 2026-01-25

### Added
- Initial public version: real-time filtering, virtual-scroll support, keyboard
  shortcuts, copy-download-link on hover, ad blocking and a glassmorphism search bar.
