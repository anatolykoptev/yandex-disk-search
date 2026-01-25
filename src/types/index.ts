export interface ScrollConfig {
  readonly step: number;
  readonly delay: number;
  readonly stabilityThreshold: number;
}

export interface DebounceConfig {
  readonly search: number;
  readonly scroll: number;
}

export interface DOMSelectors {
  readonly listItem: string;
  readonly itemTitle: string;
  readonly listing: string;
  readonly header: string;
  readonly imageViewer: string;
}

export interface Config {
  readonly version: string;
  readonly scroll: ScrollConfig;
  readonly debounce: DebounceConfig;
  readonly selectors: DOMSelectors;
}

export interface SearchResult {
  readonly matches: number;
  readonly total: number;
  readonly query: string;
}

export interface UIElements {
  bar: HTMLDivElement;
  input: HTMLInputElement;
  clear: HTMLButtonElement;
  counter: HTMLSpanElement;
  progress: HTMLDivElement;
  status: HTMLDivElement;
  spinner: HTMLDivElement;
}

export type ProgressCallback = (count: number, progress: number) => void;
export type FilterCallback = () => void;
