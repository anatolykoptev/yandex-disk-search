import { describe, it, expect, beforeEach } from 'vitest';
import { Filter } from '../services/filter';

// Mock DOM
const createMockItem = (name: string): HTMLElement => {
  const item = document.createElement('div');
  item.className = 'listing-item';

  const title = document.createElement('span');
  title.className = 'listing-item__title';
  title.textContent = name;

  item.appendChild(title);
  return item;
};

describe('Filter', () => {
  let filter: Filter;
  let container: HTMLElement;

  beforeEach(() => {
    filter = new Filter();

    // Setup DOM
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.className = 'listing';
    document.body.appendChild(container);
  });

  const addItems = (...names: string[]) => {
    names.forEach((name) => {
      container.appendChild(createMockItem(name));
    });
  };

  describe('apply', () => {
    it('should show all items when query is empty', () => {
      addItems('file1.pdf', 'file2.jpg', 'file3.txt');

      filter.apply('');

      const items = container.querySelectorAll('.listing-item');
      items.forEach((item) => {
        expect(item.classList.contains('yds-hidden-item')).toBe(false);
      });
    });

    it('should hide non-matching items', () => {
      addItems('document.pdf', 'photo.jpg', 'report.pdf');

      filter.apply('pdf');

      const items = container.querySelectorAll('.listing-item');
      expect(items[0].classList.contains('yds-hidden-item')).toBe(false); // document.pdf
      expect(items[1].classList.contains('yds-hidden-item')).toBe(true); // photo.jpg
      expect(items[2].classList.contains('yds-hidden-item')).toBe(false); // report.pdf
    });

    it('should be case-insensitive', () => {
      addItems('Document.PDF', 'PHOTO.JPG');

      filter.apply('pdf');

      const items = container.querySelectorAll('.listing-item');
      expect(items[0].classList.contains('yds-hidden-item')).toBe(false);
      expect(items[1].classList.contains('yds-hidden-item')).toBe(true);
    });

    it('should handle cyrillic characters', () => {
      addItems('документ.pdf', 'фото.jpg', 'отчёт.pdf');

      filter.apply('документ');

      const items = container.querySelectorAll('.listing-item');
      expect(items[0].classList.contains('yds-hidden-item')).toBe(false);
      expect(items[1].classList.contains('yds-hidden-item')).toBe(true);
      expect(items[2].classList.contains('yds-hidden-item')).toBe(true);
    });

    it('should handle undefined query', () => {
      addItems('file1.pdf', 'file2.jpg');

      filter.apply(undefined);

      const items = container.querySelectorAll('.listing-item');
      items.forEach((item) => {
        expect(item.classList.contains('yds-hidden-item')).toBe(false);
      });
    });

    it('should trim whitespace from query', () => {
      addItems('file.pdf', 'other.txt');

      filter.apply('  pdf  ');

      const items = container.querySelectorAll('.listing-item');
      expect(items[0].classList.contains('yds-hidden-item')).toBe(false);
      expect(items[1].classList.contains('yds-hidden-item')).toBe(true);
    });

    it('should handle partial matches anywhere in name', () => {
      addItems('my_document_v2.pdf', 'photo.jpg');

      filter.apply('document');

      const items = container.querySelectorAll('.listing-item');
      expect(items[0].classList.contains('yds-hidden-item')).toBe(false);
      expect(items[1].classList.contains('yds-hidden-item')).toBe(true);
    });
  });
});
