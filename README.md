# Yandex Disk Search

Chrome extension for fast file search on public Yandex Disk pages.

## Features

- **Real-time filtering** — instant search results as you type
- **Virtual scroll support** — works with large folders (500+ files)
- **Keyboard shortcuts** — `Cmd/Ctrl + F` to focus, `Esc` to clear
- **Copy download links** — hover over file to copy direct download URL
- **Ad blocking** — removes promotional elements
- **Modern UI** — glassmorphism design with blur effects

## Installation

### From source
```bash
git clone https://github.com/anatolykoptev/yandex-disk-search.git
cd yandex-disk-search
npm install
npm run build
```

Then load in Chrome:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

## Development

```bash
npm run watch    # Watch mode with auto-rebuild
npm run build    # Production build
npm run type-check  # TypeScript validation
```

## Project Structure

```
yandex-disk-search/
├── src/
│   ├── types/           # TypeScript interfaces
│   ├── constants/       # Config, timeouts, styles
│   ├── services/        # Business logic
│   │   ├── state.ts     # State management
│   │   ├── filter.ts    # Search filtering
│   │   ├── harvester.ts # File list loader
│   │   └── copy-handler.ts
│   ├── ui/
│   │   └── search-bar.ts
│   ├── utils/           # DOM helpers, logger
│   └── content.ts       # Entry point
├── dist/
│   └── content.js       # Built extension
├── icons/
├── _locales/
├── manifest.json
├── tsconfig.json
└── package.json
```

## Tech Stack

- TypeScript 5.9
- esbuild (bundler)
- Chrome Extension Manifest V3

## Requirements

- Chrome 88+
- Works on `disk.yandex.ru` pages

## License

MIT
