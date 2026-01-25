import { CONFIG } from '../constants/config';

const PREFIX = '[YDS]';

export function log(...args: unknown[]): void {
  console.log(PREFIX, ...args);
}

export function logVersion(): void {
  log(`v${CONFIG.version} ready`);
}

export function logFilter(query: string, total: number, shown: number, hidden: number): void {
  log(`Filter applied: query="${query}", total=${total}, shown=${shown}, hidden=${hidden}`);
}

export function logError(context: string, error: unknown): void {
  console.error(PREFIX, context, error);
}
