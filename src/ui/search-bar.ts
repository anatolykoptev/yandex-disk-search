import { CONFIG, TIMEOUTS } from '../constants/config';
import { STYLES } from '../constants/styles';
import { injectStyles, removeElement } from '../utils/dom';
import { log } from '../utils/logger';
import type { StateManager } from '../services/state';
import type { ItemHarvester } from '../services/harvester';
import type { Filter } from '../services/filter';
import type { SearchResult, UIElements } from '../types';

const SEARCH_BAR_HTML = `
  <div class="yds-inner">
    <div class="yds-search-wrapper">
      <input type="text" id="yds-input" placeholder="Поиск по файлам..." autocomplete="off">
      <svg class="yds-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <button id="yds-clear" type="button" title="Очистить (Esc)">✕</button>
      <div id="yds-progress"></div>
    </div>
    <div class="yds-stats">
      <div class="yds-spinner" id="yds-spinner"></div>
      <span id="yds-counter">—</span>
      <span class="yds-kbd">⌘F</span>
    </div>
  </div>
  <div id="yds-status"></div>
`;

export class SearchUI {
  private state: StateManager;
  private harvester: ItemHarvester;
  private filter: Filter;
  private el: Partial<UIElements> = {};
  private modalObserver: MutationObserver | null = null;
  private listingObserver: MutationObserver | null = null;

  constructor(state: StateManager, harvester: ItemHarvester, filter: Filter) {
    this.state = state;
    this.harvester = harvester;
    this.filter = filter;
  }

  create(): boolean {
    if (document.getElementById('yds-search-bar')) return false;

    injectStyles('yds-styles', STYLES);

    const bar = document.createElement('div');
    bar.id = 'yds-search-bar';
    bar.innerHTML = SEARCH_BAR_HTML;
    bar.classList.add('yds-hidden', 'yds-instant');

    document.body.prepend(bar);
    document.body.classList.add('yds-page-offset');

    this.el = {
      bar: bar as HTMLDivElement,
      input: document.getElementById('yds-input') as HTMLInputElement,
      clear: document.getElementById('yds-clear') as HTMLButtonElement,
      counter: document.getElementById('yds-counter') as HTMLSpanElement,
      progress: document.getElementById('yds-progress') as HTMLDivElement,
      status: document.getElementById('yds-status') as HTMLDivElement,
      spinner: document.getElementById('yds-spinner') as HTMLDivElement,
    };

    this.bindEvents();
    this.updateCounter();

    setTimeout(() => {
      if (!this.isViewerVisible()) {
        bar.classList.remove('yds-hidden');
      }
      setTimeout(() => bar.classList.remove('yds-instant'), TIMEOUTS.ANIMATION_ENABLE_DELAY);
    }, TIMEOUTS.INITIAL_SHOW_DELAY);

    return true;
  }

  destroy(): void {
    this.modalObserver?.disconnect();
    this.listingObserver?.disconnect();
    removeElement('yds-search-bar');
    removeElement('yds-styles');
    document.body.classList.remove('yds-page-offset');
  }

  private isViewerVisible(): boolean {
    const viewer = document.querySelector<HTMLElement>(CONFIG.selectors.imageViewer);
    if (!viewer) return false;

    const style = window.getComputedStyle(viewer);
    const hasSize = viewer.offsetWidth > 0 && viewer.offsetHeight > 0;
    const isDisplayed = style.display !== 'none';
    const isVisible = style.visibility !== 'hidden';
    const hasOpacity = parseFloat(style.opacity) > 0;

    return hasSize && isDisplayed && isVisible && hasOpacity;
  }

  private bindEvents(): void {
    const { input, clear, bar } = this.el;
    if (!input || !clear || !bar) return;

    input.addEventListener('input', () => this.handleSearch());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.clearSearch();
    });

    clear.addEventListener('click', () => {
      this.clearSearch();
      input.focus();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    let scrollTimer: ReturnType<typeof setTimeout>;
    window.addEventListener(
      'scroll',
      () => {
        if (!this.state.currentQuery) return;
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(
          () => this.filter.apply(this.state.currentQuery),
          CONFIG.debounce.scroll
        );
      },
      { passive: true }
    );

    this.startModalObserver();
  }

  private startModalObserver(): void {
    let checkTimeout: ReturnType<typeof setTimeout>;

    const checkViewer = (): void => {
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(() => {
        const shouldHide = this.isViewerVisible();
        this.el.bar?.classList.toggle('yds-hidden', shouldHide);
      }, TIMEOUTS.VIEWER_CHECK_DELAY);
    };

    this.modalObserver = new MutationObserver(checkViewer);
    this.modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.startListingObserver();
  }

  private startListingObserver(): void {
    let filterTimeout: ReturnType<typeof setTimeout>;

    const listingItems =
      document.querySelector('.listing__items') ||
      document.querySelector(CONFIG.selectors.listing);

    if (!listingItems) return;

    this.listingObserver = new MutationObserver(() => {
      if (!this.state.currentQuery || this.state.isLoading) return;
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(
        () => this.filter.apply(this.state.currentQuery),
        TIMEOUTS.FILTER_APPLY_DELAY
      );
    });

    this.listingObserver.observe(listingItems, { childList: true });
  }

  private async handleSearch(): Promise<void> {
    const { input, clear } = this.el;
    if (!input || !clear) return;

    const query = input.value.trim();
    clear.classList.toggle('visible', query.length > 0);

    this.state.currentQuery = query.toLowerCase().trim();

    if (query && !this.state.isLoaded && !this.state.isLoading) {
      await this.loadAll();

      this.harvester.harvest();

      this.listingObserver?.disconnect();
      this.startListingObserver();

      log('Starting continuous filter application...');
      await this.applyFilterContinuously(TIMEOUTS.FILTER_CONTINUOUS_DURATION);
      log('Continuous filter complete');
    }

    const currentQuery = input.value.trim();
    this.state.currentQuery = currentQuery.toLowerCase().trim();
    const result = this.state.search(currentQuery);
    this.filter.apply(currentQuery);
    this.updateCounter(result);
  }

  private applyFilterContinuously(durationMs: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let frameCount = 0;

      const applyFrame = (): void => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= durationMs) {
          log(`Applied filter ${frameCount} times over ${elapsed}ms`);
          resolve();
          return;
        }

        const q = this.el.input?.value.toLowerCase().trim() || '';
        if (q) {
          this.state.currentQuery = q;
          this.filter.apply(q);
        }
        frameCount++;
        requestAnimationFrame(applyFrame);
      };

      requestAnimationFrame(applyFrame);
    });
  }

  private async loadAll(): Promise<void> {
    const { progress, spinner, status, input, counter } = this.el;
    if (!progress || !spinner || !status || !input || !counter) return;

    const getCurrentQuery = (): string => input.value.toLowerCase().trim();

    spinner.classList.add('visible');
    progress.classList.add('active');
    status.classList.add('visible');

    try {
      await this.harvester.loadAll(
        (count) => {
          const q = getCurrentQuery();
          status.textContent = `Загружено ${count} файлов...`;
          if (q) {
            const matches = this.state.search(q).matches;
            counter.innerHTML = `<span class="yds-match">${matches}</span> из ${count}`;
          } else {
            counter.innerHTML = `${count} файлов`;
          }
        },
        () => {
          const q = getCurrentQuery();
          if (q) {
            this.state.currentQuery = q;
            this.filter.apply(q);
          }
        },
        () => {
          const q = getCurrentQuery();
          if (q) {
            this.state.currentQuery = q;
            this.filter.apply(q);
          }
        }
      );
    } finally {
      setTimeout(() => {
        spinner.classList.remove('visible');
        progress.classList.remove('active');
        status.classList.remove('visible');
      }, 200);
    }
  }

  private updateCounter(result?: SearchResult): void {
    const { counter } = this.el;
    if (!counter) return;

    if (!result) {
      this.harvester.harvest();
      counter.innerHTML = `${this.state.size} файлов`;
      return;
    }

    if (result.query) {
      counter.innerHTML = `<span class="yds-match">${result.matches}</span> из ${result.total}`;
    } else {
      counter.innerHTML = `${result.total} файлов`;
    }
  }

  private clearSearch(): void {
    const { input, clear } = this.el;
    if (!input || !clear) return;

    input.value = '';
    clear.classList.remove('visible');
    this.filter.apply('');
    this.state.currentQuery = '';
    this.updateCounter({ matches: this.state.size, total: this.state.size, query: '' });
  }
}
