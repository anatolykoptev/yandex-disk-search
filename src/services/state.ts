import type { SearchResult } from '../types';

export class StateManager {
  private items: Map<string, boolean>;
  private _isLoading: boolean;
  private _isLoaded: boolean;
  private _currentQuery: string;

  constructor() {
    this.items = new Map();
    this._isLoading = false;
    this._isLoaded = false;
    this._currentQuery = '';
  }

  reset(): void {
    this.items = new Map();
    this._isLoading = false;
    this._isLoaded = false;
    this._currentQuery = '';
  }

  get size(): number {
    return this.items.size;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  set isLoading(value: boolean) {
    this._isLoading = value;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  set isLoaded(value: boolean) {
    this._isLoaded = value;
  }

  get currentQuery(): string {
    return this._currentQuery;
  }

  set currentQuery(value: string) {
    this._currentQuery = value;
  }

  addItem(name: string): boolean {
    if (name && !this.items.has(name)) {
      this.items.set(name, true);
      return true;
    }
    return false;
  }

  search(query: string): SearchResult {
    const q = query.toLowerCase().trim();
    this._currentQuery = q;

    if (!q) {
      return { matches: this.size, total: this.size, query: '' };
    }

    let matches = 0;
    this.items.forEach((_, name) => {
      if (name.toLowerCase().includes(q)) {
        matches++;
      }
    });

    return { matches, total: this.size, query: q };
  }
}
