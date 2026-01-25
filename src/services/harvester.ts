import { CONFIG, TIMEOUTS } from '../constants/config';
import { getListItems, getItemName } from '../utils/dom';
import type { StateManager } from './state';
import type { ProgressCallback, FilterCallback } from '../types';

export class ItemHarvester {
  private state: StateManager;

  constructor(state: StateManager) {
    this.state = state;
  }

  harvest(): void {
    getListItems().forEach((el) => {
      this.state.addItem(getItemName(el));
    });
  }

  async loadAll(
    onProgress?: ProgressCallback,
    onScrollComplete?: FilterCallback,
    onFilter?: FilterCallback
  ): Promise<number> {
    if (this.state.isLoaded || this.state.isLoading) {
      return this.state.size;
    }

    this.state.isLoading = true;
    let lastSize = 0;
    let stableCount = 0;

    this.harvest();

    while (stableCount < CONFIG.scroll.stabilityThreshold) {
      window.scrollBy(0, CONFIG.scroll.step);
      await this.delay(CONFIG.scroll.delay);
      this.harvest();
      onFilter?.();

      if (this.state.size === lastSize) {
        stableCount++;
      } else {
        stableCount = 0;
        lastSize = this.state.size;
      }

      onProgress?.(this.state.size, stableCount / CONFIG.scroll.stabilityThreshold);
    }

    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    await this.waitForScrollTop();

    onScrollComplete?.();
    await this.delay(TIMEOUTS.POST_SCROLL_DELAY);
    onScrollComplete?.();
    await this.delay(TIMEOUTS.POST_SCROLL_EXTRA);
    onScrollComplete?.();

    this.state.isLoading = false;
    this.state.isLoaded = true;

    return this.state.size;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private waitForScrollTop(): Promise<void> {
    return new Promise((resolve) => {
      let checks = 0;

      const checkScroll = (): void => {
        checks++;
        if (window.scrollY === 0 || checks >= TIMEOUTS.SCROLL_TOP_MAX_CHECKS) {
          setTimeout(resolve, TIMEOUTS.SCROLL_TOP_SETTLE);
        } else {
          setTimeout(checkScroll, TIMEOUTS.SCROLL_TOP_CHECK_INTERVAL);
        }
      };

      setTimeout(checkScroll, TIMEOUTS.SCROLL_TOP_CHECK_INTERVAL * 2);
    });
  }
}
