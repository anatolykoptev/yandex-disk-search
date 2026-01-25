"use strict";
(() => {
  // src/constants/config.ts
  var CONFIG = Object.freeze({
    version: "2.3.0",
    scroll: {
      step: 800,
      delay: 60,
      stabilityThreshold: 20
    },
    debounce: {
      search: 80,
      scroll: 30
    },
    selectors: {
      listItem: ".listing-item",
      itemTitle: ".listing-item__title, .listing-item__name",
      listing: ".listing",
      header: ".public-page__header",
      imageViewer: ".slider"
    }
  });
  var TIMEOUTS = Object.freeze({
    VIEWER_CHECK_DELAY: 150,
    FILTER_CONTINUOUS_DURATION: 2e3,
    INIT_POLL_INTERVAL: 150,
    INIT_MAX_WAIT: 15e3,
    POST_SCROLL_DELAY: 300,
    POST_SCROLL_EXTRA: 500,
    COPY_FEEDBACK_DURATION: 1500,
    ANIMATION_ENABLE_DELAY: 50,
    INITIAL_SHOW_DELAY: 100,
    URL_CHANGE_REINIT_DELAY: 500,
    SCROLL_TOP_CHECK_INTERVAL: 50,
    SCROLL_TOP_MAX_CHECKS: 50,
    SCROLL_TOP_SETTLE: 300,
    FILTER_APPLY_DELAY: 50
  });

  // src/constants/styles.ts
  var STYLES = `
  #yds-search-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }

  #yds-search-bar.yds-hidden {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
  }

  #yds-search-bar.yds-instant {
    transition: none !important;
  }

  .yds-inner {
    display: flex;
    align-items: center;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
  }

  .yds-search-wrapper {
    position: relative;
    flex: 1;
  }

  #yds-input {
    width: 100%;
    padding: 14px 48px 14px 48px;
    font-size: 15px;
    font-weight: 400;
    color: #1a1a1a;
    background: #f5f5f7;
    border: 2px solid transparent;
    border-radius: 14px;
    outline: none;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  #yds-input:hover { background: #efefef; }

  #yds-input:focus {
    background: #fff;
    border-color: #ffcc00;
    box-shadow: 0 0 0 4px rgba(255, 204, 0, 0.2);
  }

  #yds-input::placeholder { color: #999; }

  .yds-icon-search {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: #999;
    pointer-events: none;
    transition: color 0.2s;
  }

  #yds-input:focus ~ .yds-icon-search { color: #ffcc00; }

  #yds-clear {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.06);
    border: none;
    border-radius: 8px;
    color: #666;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  #yds-clear:hover { background: rgba(0, 0, 0, 0.1); color: #333; }
  #yds-clear.visible { display: flex; }

  .yds-stats {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  #yds-counter {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    white-space: nowrap;
  }

  #yds-counter .yds-match {
    color: #1a1a1a;
    font-weight: 600;
  }

  .yds-kbd {
    display: none;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 500;
    color: #999;
    background: rgba(0, 0, 0, 0.04);
    border-radius: 6px;
  }

  @media (min-width: 768px) { .yds-kbd { display: inline-block; } }

  #yds-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #f0f0f0;
    border-radius: 0 0 14px 14px;
    overflow: hidden;
    opacity: 0;
  }

  #yds-progress.active { opacity: 1; }

  #yds-progress::after {
    content: '';
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #ffcc00, #ff9500, transparent);
    animation: yds-progress-slide 1s ease-in-out infinite;
  }

  @keyframes yds-progress-slide {
    0% { left: -50%; }
    100% { left: 100%; }
  }

  #yds-status {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -24px;
    font-size: 12px;
    color: #999;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s;
  }

  #yds-status.visible { opacity: 1; }

  .yds-spinner {
    display: none;
    width: 20px;
    height: 20px;
    border: 2px solid #e5e5e5;
    border-top-color: #ffcc00;
    border-radius: 50%;
    animation: yds-spin 0.8s linear infinite;
  }

  .yds-spinner.visible { display: block; }

  @keyframes yds-spin { to { transform: rotate(360deg); } }

  .yds-page-offset { padding-top: 70px !important; }

  .yds-hidden-item {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }

  .yds-copy-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(255, 204, 0, 0.9);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    z-index: 10;
    transition: all 0.15s ease;
  }

  .listing-item:hover .yds-copy-btn { display: flex; }
  .yds-copy-btn:hover { background: #ffcc00; transform: translateY(-50%) scale(1.1); }
  .yds-copy-btn svg { width: 14px; height: 14px; color: #333; }

  .yds-copy-btn.copied { background: #4caf50; }
  .yds-copy-btn.copied svg { color: white; }

  .listing-item { position: relative; }
`;
  var AD_BLOCK_STYLES = `
  .promozavr-anchor,
  .DownloadMobileQR,
  .PremiumButton,
  .PSHeader-Right .Button2_view_promo,
  .aside-promo,
  .direct-ads,
  [class*="promo-"]:not(.promozavr-anchor--alice),
  .ya-chat-loader,
  .adsdk-block {
    display: none !important;
  }
`;

  // src/utils/dom.ts
  function getListItems() {
    return document.querySelectorAll(CONFIG.selectors.listItem);
  }
  function getItemName(el) {
    var _a, _b, _c;
    const titleEl = el.querySelector(CONFIG.selectors.itemTitle);
    return ((_a = titleEl == null ? void 0 : titleEl.textContent) == null ? void 0 : _a.trim()) || ((_c = (_b = el.innerText) == null ? void 0 : _b.split("\n")[0]) == null ? void 0 : _c.trim()) || "";
  }
  function showElement(el) {
    el.style.cssText = el.style.cssText.replace(/display\s*:\s*none\s*!important\s*;?/gi, "");
    el.classList.remove("yds-hidden-item");
  }
  function hideElement(el) {
    el.style.setProperty("display", "none", "important");
    el.classList.add("yds-hidden-item");
  }
  function injectStyles(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    if (document.head) {
      document.head.appendChild(style);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(style);
      });
    }
  }
  function removeElement(id) {
    var _a;
    (_a = document.getElementById(id)) == null ? void 0 : _a.remove();
  }

  // src/utils/logger.ts
  var PREFIX = "[YDS]";
  function log(...args) {
    console.log(PREFIX, ...args);
  }
  function logVersion() {
    log(`v${CONFIG.version} ready`);
  }
  function logFilter(query, total, shown, hidden) {
    log(`Filter applied: query="${query}", total=${total}, shown=${shown}, hidden=${hidden}`);
  }
  function logError(context, error) {
    console.error(PREFIX, context, error);
  }

  // src/services/state.ts
  var StateManager = class {
    constructor() {
      this.items = /* @__PURE__ */ new Map();
      this._isLoading = false;
      this._isLoaded = false;
      this._currentQuery = "";
    }
    reset() {
      this.items = /* @__PURE__ */ new Map();
      this._isLoading = false;
      this._isLoaded = false;
      this._currentQuery = "";
    }
    get size() {
      return this.items.size;
    }
    get isLoading() {
      return this._isLoading;
    }
    set isLoading(value) {
      this._isLoading = value;
    }
    get isLoaded() {
      return this._isLoaded;
    }
    set isLoaded(value) {
      this._isLoaded = value;
    }
    get currentQuery() {
      return this._currentQuery;
    }
    set currentQuery(value) {
      this._currentQuery = value;
    }
    addItem(name) {
      if (name && !this.items.has(name)) {
        this.items.set(name, true);
        return true;
      }
      return false;
    }
    search(query) {
      const q = query.toLowerCase().trim();
      this._currentQuery = q;
      if (!q) {
        return { matches: this.size, total: this.size, query: "" };
      }
      let matches = 0;
      this.items.forEach((_, name) => {
        if (name.toLowerCase().includes(q)) {
          matches++;
        }
      });
      return { matches, total: this.size, query: q };
    }
  };

  // src/services/harvester.ts
  var ItemHarvester = class {
    constructor(state) {
      this.state = state;
    }
    harvest() {
      getListItems().forEach((el) => {
        this.state.addItem(getItemName(el));
      });
    }
    async loadAll(onProgress, onScrollComplete, onFilter) {
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
        onFilter == null ? void 0 : onFilter();
        if (this.state.size === lastSize) {
          stableCount++;
        } else {
          stableCount = 0;
          lastSize = this.state.size;
        }
        onProgress == null ? void 0 : onProgress(this.state.size, stableCount / CONFIG.scroll.stabilityThreshold);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await this.waitForScrollTop();
      onScrollComplete == null ? void 0 : onScrollComplete();
      await this.delay(TIMEOUTS.POST_SCROLL_DELAY);
      onScrollComplete == null ? void 0 : onScrollComplete();
      await this.delay(TIMEOUTS.POST_SCROLL_EXTRA);
      onScrollComplete == null ? void 0 : onScrollComplete();
      this.state.isLoading = false;
      this.state.isLoaded = true;
      return this.state.size;
    }
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    waitForScrollTop() {
      return new Promise((resolve) => {
        let checks = 0;
        const checkScroll = () => {
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
  };

  // src/services/filter.ts
  var Filter = class {
    constructor() {
    }
    apply(query) {
      const q = (query == null ? void 0 : query.toLowerCase().trim()) || "";
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
  };

  // src/services/copy-handler.ts
  var COPY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="9" y="9" width="13" height="13" rx="2"/>
  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
</svg>`;
  var CHECK_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 6L9 17l-5-5"/>
</svg>`;
  var CopyLinkHandler = class {
    constructor() {
      this.observer = null;
    }
    init() {
      this.addCopyButtons();
      const listing = document.querySelector(".listing__items, .listing");
      if (listing) {
        this.observer = new MutationObserver(() => this.addCopyButtons());
        this.observer.observe(listing, { childList: true, subtree: true });
      }
    }
    destroy() {
      var _a;
      (_a = this.observer) == null ? void 0 : _a.disconnect();
      this.observer = null;
    }
    addCopyButtons() {
      getListItems().forEach((item) => {
        var _a;
        if (item.querySelector(".yds-copy-btn")) return;
        const titleEl = item.querySelector(CONFIG.selectors.itemTitle);
        if (!titleEl) return;
        const name = (_a = titleEl.textContent) == null ? void 0 : _a.trim();
        if (!name) return;
        const btn = this.createButton(name);
        item.style.position = "relative";
        item.appendChild(btn);
      });
    }
    createButton(name) {
      const btn = document.createElement("button");
      btn.className = "yds-copy-btn";
      btn.title = "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443";
      btn.innerHTML = COPY_ICON;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}${window.location.pathname}/${encodeURIComponent(name)}`;
        this.copyLink(url, btn);
      });
      return btn;
    }
    async copyLink(url, btn) {
      try {
        const directUrl = this.getDirectLink(url);
        await navigator.clipboard.writeText(directUrl);
        btn.classList.add("copied");
        btn.innerHTML = CHECK_ICON;
        setTimeout(() => {
          btn.classList.remove("copied");
          btn.innerHTML = COPY_ICON;
        }, TIMEOUTS.COPY_FEEDBACK_DURATION);
      } catch (error) {
        logError("Copy failed:", error);
      }
    }
    getDirectLink(url) {
      if (url.includes("disk.yandex.ru")) {
        const urlObj = new URL(url);
        urlObj.searchParams.set("download", "1");
        return urlObj.toString();
      }
      return url;
    }
  };

  // src/ui/search-bar.ts
  var SEARCH_BAR_HTML = `
  <div class="yds-inner">
    <div class="yds-search-wrapper">
      <input type="text" id="yds-input" placeholder="\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0444\u0430\u0439\u043B\u0430\u043C..." autocomplete="off">
      <svg class="yds-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>
      <button id="yds-clear" type="button" title="\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C (Esc)">\u2715</button>
      <div id="yds-progress"></div>
    </div>
    <div class="yds-stats">
      <div class="yds-spinner" id="yds-spinner"></div>
      <span id="yds-counter">\u2014</span>
      <span class="yds-kbd">\u2318F</span>
    </div>
  </div>
  <div id="yds-status"></div>
`;
  var SearchUI = class {
    constructor(state, harvester, filter) {
      this.el = {};
      this.modalObserver = null;
      this.listingObserver = null;
      this.state = state;
      this.harvester = harvester;
      this.filter = filter;
    }
    create() {
      if (document.getElementById("yds-search-bar")) return false;
      injectStyles("yds-styles", STYLES);
      const bar = document.createElement("div");
      bar.id = "yds-search-bar";
      bar.innerHTML = SEARCH_BAR_HTML;
      bar.classList.add("yds-hidden", "yds-instant");
      document.body.prepend(bar);
      document.body.classList.add("yds-page-offset");
      this.el = {
        bar,
        input: document.getElementById("yds-input"),
        clear: document.getElementById("yds-clear"),
        counter: document.getElementById("yds-counter"),
        progress: document.getElementById("yds-progress"),
        status: document.getElementById("yds-status"),
        spinner: document.getElementById("yds-spinner")
      };
      this.bindEvents();
      this.updateCounter();
      setTimeout(() => {
        if (!this.isViewerVisible()) {
          bar.classList.remove("yds-hidden");
        }
        setTimeout(() => bar.classList.remove("yds-instant"), TIMEOUTS.ANIMATION_ENABLE_DELAY);
      }, TIMEOUTS.INITIAL_SHOW_DELAY);
      return true;
    }
    destroy() {
      var _a, _b;
      (_a = this.modalObserver) == null ? void 0 : _a.disconnect();
      (_b = this.listingObserver) == null ? void 0 : _b.disconnect();
      removeElement("yds-search-bar");
      removeElement("yds-styles");
      document.body.classList.remove("yds-page-offset");
    }
    isViewerVisible() {
      const viewer = document.querySelector(CONFIG.selectors.imageViewer);
      if (!viewer) return false;
      const style = window.getComputedStyle(viewer);
      const hasSize = viewer.offsetWidth > 0 && viewer.offsetHeight > 0;
      const isDisplayed = style.display !== "none";
      const isVisible = style.visibility !== "hidden";
      const hasOpacity = parseFloat(style.opacity) > 0;
      return hasSize && isDisplayed && isVisible && hasOpacity;
    }
    bindEvents() {
      const { input, clear, bar } = this.el;
      if (!input || !clear || !bar) return;
      input.addEventListener("input", () => this.handleSearch());
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.clearSearch();
      });
      clear.addEventListener("click", () => {
        this.clearSearch();
        input.focus();
      });
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "f") {
          e.preventDefault();
          input.focus();
          input.select();
        }
      });
      let scrollTimer;
      window.addEventListener(
        "scroll",
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
    startModalObserver() {
      let checkTimeout;
      const checkViewer = () => {
        clearTimeout(checkTimeout);
        checkTimeout = setTimeout(() => {
          var _a;
          const shouldHide = this.isViewerVisible();
          (_a = this.el.bar) == null ? void 0 : _a.classList.toggle("yds-hidden", shouldHide);
        }, TIMEOUTS.VIEWER_CHECK_DELAY);
      };
      this.modalObserver = new MutationObserver(checkViewer);
      this.modalObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.startListingObserver();
    }
    startListingObserver() {
      let filterTimeout;
      const listingItems = document.querySelector(".listing__items") || document.querySelector(CONFIG.selectors.listing);
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
    async handleSearch() {
      var _a;
      const { input, clear } = this.el;
      if (!input || !clear) return;
      const query = input.value.trim();
      clear.classList.toggle("visible", query.length > 0);
      this.state.currentQuery = query.toLowerCase().trim();
      if (query && !this.state.isLoaded && !this.state.isLoading) {
        await this.loadAll();
        this.harvester.harvest();
        (_a = this.listingObserver) == null ? void 0 : _a.disconnect();
        this.startListingObserver();
        log("Starting continuous filter application...");
        await this.applyFilterContinuously(TIMEOUTS.FILTER_CONTINUOUS_DURATION);
        log("Continuous filter complete");
      }
      const currentQuery = input.value.trim();
      this.state.currentQuery = currentQuery.toLowerCase().trim();
      const result = this.state.search(currentQuery);
      this.filter.apply(currentQuery);
      this.updateCounter(result);
    }
    applyFilterContinuously(durationMs) {
      return new Promise((resolve) => {
        const startTime = Date.now();
        let frameCount = 0;
        const applyFrame = () => {
          var _a;
          const elapsed = Date.now() - startTime;
          if (elapsed >= durationMs) {
            log(`Applied filter ${frameCount} times over ${elapsed}ms`);
            resolve();
            return;
          }
          const q = ((_a = this.el.input) == null ? void 0 : _a.value.toLowerCase().trim()) || "";
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
    async loadAll() {
      const { progress, spinner, status, input, counter } = this.el;
      if (!progress || !spinner || !status || !input || !counter) return;
      const getCurrentQuery = () => input.value.toLowerCase().trim();
      spinner.classList.add("visible");
      progress.classList.add("active");
      status.classList.add("visible");
      try {
        await this.harvester.loadAll(
          (count) => {
            const q = getCurrentQuery();
            status.textContent = `\u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043E ${count} \u0444\u0430\u0439\u043B\u043E\u0432...`;
            if (q) {
              const matches = this.state.search(q).matches;
              counter.innerHTML = `<span class="yds-match">${matches}</span> \u0438\u0437 ${count}`;
            } else {
              counter.innerHTML = `${count} \u0444\u0430\u0439\u043B\u043E\u0432`;
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
          spinner.classList.remove("visible");
          progress.classList.remove("active");
          status.classList.remove("visible");
        }, 200);
      }
    }
    updateCounter(result) {
      const { counter } = this.el;
      if (!counter) return;
      if (!result) {
        this.harvester.harvest();
        counter.innerHTML = `${this.state.size} \u0444\u0430\u0439\u043B\u043E\u0432`;
        return;
      }
      if (result.query) {
        counter.innerHTML = `<span class="yds-match">${result.matches}</span> \u0438\u0437 ${result.total}`;
      } else {
        counter.innerHTML = `${result.total} \u0444\u0430\u0439\u043B\u043E\u0432`;
      }
    }
    clearSearch() {
      const { input, clear } = this.el;
      if (!input || !clear) return;
      input.value = "";
      clear.classList.remove("visible");
      this.filter.apply("");
      this.state.currentQuery = "";
      this.updateCounter({ matches: this.state.size, total: this.state.size, query: "" });
    }
  };

  // src/content.ts
  var YandexDiskSearch = class {
    constructor() {
      this.copyHandler = null;
      this.initTimer = null;
      this.state = new StateManager();
      this.harvester = new ItemHarvester(this.state);
      this.filter = new Filter();
      this.ui = new SearchUI(this.state, this.harvester, this.filter);
    }
    init() {
      if (!/\/(d|i)\//.test(location.pathname)) return;
      this.initTimer = setInterval(() => {
        if (document.querySelector(CONFIG.selectors.listItem)) {
          if (this.initTimer) clearInterval(this.initTimer);
          this.ui.create();
          this.copyHandler = new CopyLinkHandler();
          this.copyHandler.init();
          logVersion();
        }
      }, TIMEOUTS.INIT_POLL_INTERVAL);
      setTimeout(() => {
        if (this.initTimer) clearInterval(this.initTimer);
      }, TIMEOUTS.INIT_MAX_WAIT);
    }
    reset() {
      var _a;
      this.ui.destroy();
      (_a = this.copyHandler) == null ? void 0 : _a.destroy();
      this.state.reset();
      this.copyHandler = null;
    }
  };
  function bootstrap() {
    if (window.__YandexDiskSearch) return;
    injectStyles("yds-adblock", AD_BLOCK_STYLES);
    const app = new YandexDiskSearch();
    window.__YandexDiskSearch = app;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => app.init());
    } else {
      app.init();
    }
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        app.reset();
        setTimeout(() => app.init(), TIMEOUTS.URL_CHANGE_REINIT_DELAY);
      }
    }).observe(document, { subtree: true, childList: true });
  }
  bootstrap();
})();
