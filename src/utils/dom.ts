import { CONFIG } from '../constants/config';

export function getListItems(): NodeListOf<HTMLElement> {
  return document.querySelectorAll<HTMLElement>(CONFIG.selectors.listItem);
}

export function getItemName(el: HTMLElement): string {
  const titleEl = el.querySelector<HTMLElement>(CONFIG.selectors.itemTitle);
  return titleEl?.textContent?.trim() || el.innerText?.split('\n')[0]?.trim() || '';
}

export function showElement(el: HTMLElement): void {
  el.style.cssText = el.style.cssText.replace(/display\s*:\s*none\s*!important\s*;?/gi, '');
  el.classList.remove('yds-hidden-item');
}

export function hideElement(el: HTMLElement): void {
  el.style.setProperty('display', 'none', 'important');
  el.classList.add('yds-hidden-item');
}

export function injectStyles(id: string, css: string): void {
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;

  if (document.head) {
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.head.appendChild(style);
    });
  }
}

export function removeElement(id: string): void {
  document.getElementById(id)?.remove();
}
