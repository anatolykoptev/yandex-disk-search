import { getListItems, getItemName, showElement, hideElement } from '../utils/dom';
import { logFilter } from '../utils/logger';

export class Filter {
  constructor() {}

  apply(query?: string): void {
    const q = query?.toLowerCase().trim() || '';
    const items = getListItems();
    let shown = 0;
    let hidden = 0;

    items.forEach((el) => {
      const name = getItemName(el).toLowerCase();
      if (!q || name.includes(q)) {
        showElement(el);
        shown++;
      } else {
        hideElement(el);
        hidden++;
      }
    });

    logFilter(q, items.length, shown, hidden);
  }
}
