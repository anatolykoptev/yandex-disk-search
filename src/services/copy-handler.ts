import { CONFIG, TIMEOUTS } from '../constants/config';
import { getListItems } from '../utils/dom';
import { logError } from '../utils/logger';

const COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
</svg>`;

const CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6L9 17l-5-5"/>
</svg>`;

export class CopyLinkHandler {
  private observer: MutationObserver | null = null;

  init(): void {
    this.addCopyButtons();

    const listing = document.querySelector('.listing__items, .listing');
    if (listing) {
      this.observer = new MutationObserver(() => this.addCopyButtons());
      this.observer.observe(listing, { childList: true, subtree: true });
    }
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  private addCopyButtons(): void {
    getListItems().forEach((item) => {
      if (item.querySelector('.yds-copy-btn')) return;

      const titleEl = item.querySelector<HTMLElement>(CONFIG.selectors.itemTitle);
      if (!titleEl) return;

      const name = titleEl.textContent?.trim();
      if (!name) return;

      const btn = this.createButton(name);
      item.style.position = 'relative';
      item.appendChild(btn);
    });
  }

  private createButton(name: string): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = 'yds-copy-btn';
    btn.title = 'Копировать ссылку';
    btn.innerHTML = COPY_ICON;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}${window.location.pathname}/${encodeURIComponent(name)}`;
      this.copyLink(url, btn);
    });

    return btn;
  }

  private async copyLink(url: string, btn: HTMLButtonElement): Promise<void> {
    try {
      const directUrl = this.getDirectLink(url);
      await navigator.clipboard.writeText(directUrl);

      btn.classList.add('copied');
      btn.innerHTML = CHECK_ICON;

      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = COPY_ICON;
      }, TIMEOUTS.COPY_FEEDBACK_DURATION);
    } catch (error) {
      logError('Copy failed:', error);
    }
  }

  private getDirectLink(url: string): string {
    if (url.includes('disk.yandex.ru')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('download', '1');
      return urlObj.toString();
    }
    return url;
  }
}
