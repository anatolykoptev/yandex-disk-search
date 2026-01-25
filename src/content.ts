/**
 * Yandex Disk Search v2.3.0
 * Chrome Extension with TypeScript
 */

import { CONFIG, TIMEOUTS } from './constants/config';
import { AD_BLOCK_STYLES } from './constants/styles';
import { injectStyles } from './utils/dom';
import { logVersion } from './utils/logger';
import { StateManager } from './services/state';
import { ItemHarvester } from './services/harvester';
import { Filter } from './services/filter';
import { CopyLinkHandler } from './services/copy-handler';
import { SearchUI } from './ui/search-bar';

declare global {
  interface Window {
    __YandexDiskSearch?: YandexDiskSearch;
  }
}

class YandexDiskSearch {
  private state: StateManager;
  private harvester: ItemHarvester;
  private filter: Filter;
  private ui: SearchUI;
  private copyHandler: CopyLinkHandler | null = null;
  private initTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.state = new StateManager();
    this.harvester = new ItemHarvester(this.state);
    this.filter = new Filter();
    this.ui = new SearchUI(this.state, this.harvester, this.filter);
  }

  init(): void {
    if (!/\/(d|i)\//.test(location.pathname)) return;

    this.initTimer = setInterval(() => {
      if (document.querySelector(CONFIG.selectors.listItem)) {
        if (this.initTimer) clearInterval(this.initTimer);
        this.ui.create();
        this.copyHandler = new CopyLinkHandler();
        this.copyHandler.init();
        logVersion();
      }
    }, TIMEOUTS.INIT_POLL_INTERVAL);

    setTimeout(() => {
      if (this.initTimer) clearInterval(this.initTimer);
    }, TIMEOUTS.INIT_MAX_WAIT);
  }

  reset(): void {
    this.ui.destroy();
    this.copyHandler?.destroy();
    this.state.reset();
    this.copyHandler = null;
  }
}

function bootstrap(): void {
  if (window.__YandexDiskSearch) return;

  injectStyles('yds-adblock', AD_BLOCK_STYLES);

  const app = new YandexDiskSearch();
  window.__YandexDiskSearch = app;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      app.reset();
      setTimeout(() => app.init(), TIMEOUTS.URL_CHANGE_REINIT_DELAY);
    }
  }).observe(document, { subtree: true, childList: true });
}

bootstrap();
