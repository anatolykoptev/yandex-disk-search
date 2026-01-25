import type { Config } from '../types';

export const CONFIG: Config = Object.freeze({
  version: '2.3.0',
  scroll: {
    step: 800,
    delay: 60,
    stabilityThreshold: 20,
  },
  debounce: {
    search: 80,
    scroll: 30,
  },
  selectors: {
    listItem: '.listing-item',
    itemTitle: '.listing-item__title, .listing-item__name',
    listing: '.listing',
    header: '.public-page__header',
    imageViewer: '.slider',
  },
});

export const TIMEOUTS = Object.freeze({
  VIEWER_CHECK_DELAY: 150,
  FILTER_CONTINUOUS_DURATION: 2000,
  INIT_POLL_INTERVAL: 150,
  INIT_MAX_WAIT: 15000,
  POST_SCROLL_DELAY: 300,
  POST_SCROLL_EXTRA: 500,
  COPY_FEEDBACK_DURATION: 1500,
  ANIMATION_ENABLE_DELAY: 50,
  INITIAL_SHOW_DELAY: 100,
  URL_CHANGE_REINIT_DELAY: 500,
  SCROLL_TOP_CHECK_INTERVAL: 50,
  SCROLL_TOP_MAX_CHECKS: 50,
  SCROLL_TOP_SETTLE: 300,
  FILTER_APPLY_DELAY: 50,
});
