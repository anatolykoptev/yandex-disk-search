/**
 * Yandex Disk Search v2.2.0
 * Professional Chrome Extension with modern UI
 */

(function () {
    'use strict';

    if (window.__YandexDiskSearch) return;

    const CONFIG = Object.freeze({
        version: '2.2.6',
        scroll: { step: 800, delay: 60, stabilityThreshold: 20 },
        debounce: { search: 80, scroll: 30 },
        selectors: {
            listItem: '.listing-item',
            itemTitle: '.listing-item__title, .listing-item__name',
            listing: '.listing',
            header: '.public-page__header',
            imageViewer: '.slider'
        }
    });

    const styles = `
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

        /* No animation on initial load */
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

        /* === FILTER HIDE === */
        .yds-hidden-item {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            overflow: hidden !important;
        }

        /* === AD BLOCKER === */
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

        /* === COPY LINK BUTTON === */
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

        .yds-copy-btn.copied {
            background: #4caf50;
        }
        .yds-copy-btn.copied svg { color: white; }

        /* Ensure listing-item has position relative */
        .listing-item { position: relative; }
    `;

    // Ad blocking styles - inject immediately
    const adBlockStyles = `
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

    // Inject ad blocker immediately
    const adStyle = document.createElement('style');
    adStyle.id = 'yds-adblock';
    adStyle.textContent = adBlockStyles;
    if (document.head) document.head.appendChild(adStyle);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(adStyle));

    class StateManager {
        constructor() { this.reset(); }
        reset() {
            this.items = new Map();
            this.isLoading = false;
            this.isLoaded = false;
            this.currentQuery = '';
        }
        get size() { return this.items.size; }
        addItem(name) {
            if (name && !this.items.has(name)) {
                this.items.set(name, true);
                return true;
            }
            return false;
        }
        search(query) {
            const q = query.toLowerCase().trim();
            this.currentQuery = q;
            if (!q) return { matches: this.size, total: this.size, query: '' };
            let matches = 0;
            this.items.forEach((_, name) => {
                if (name.toLowerCase().includes(q)) matches++;
            });
            return { matches, total: this.size, query: q };
        }
    }

    const DOM = {
        getListItems: () => document.querySelectorAll(CONFIG.selectors.listItem),
        getItemName(el) {
            const titleEl = el.querySelector(CONFIG.selectors.itemTitle);
            return titleEl?.textContent?.trim() || el.innerText?.split('\n')[0]?.trim() || '';
        },
        show(el) {
            el.style.cssText = el.style.cssText.replace(/display\s*:\s*none\s*!important\s*;?/gi, '');
            el.classList.remove('yds-hidden-item');
        },
        hide(el) {
            el.style.setProperty('display', 'none', 'important');
            el.classList.add('yds-hidden-item');
        }
    };

    class ItemHarvester {
        constructor(state) { this.state = state; }

        harvest() {
            DOM.getListItems().forEach(el => {
                this.state.addItem(DOM.getItemName(el));
            });
        }

        async loadAll(onProgress, onScrollComplete, onFilter) {
            if (this.state.isLoaded || this.state.isLoading) return this.state.size;

            this.state.isLoading = true;
            let lastSize = 0, stableCount = 0;
            this.harvest();

            while (stableCount < CONFIG.scroll.stabilityThreshold) {
                window.scrollBy(0, CONFIG.scroll.step);
                await new Promise(r => setTimeout(r, CONFIG.scroll.delay));
                this.harvest();
                onFilter?.();

                if (this.state.size === lastSize) stableCount++;
                else { stableCount = 0; lastSize = this.state.size; }

                onProgress?.(this.state.size, stableCount / CONFIG.scroll.stabilityThreshold);
            }

            window.scrollTo({ top: 0, behavior: 'instant' });
            await this.waitForScrollTop();

            // Apply filter multiple times to catch DOM rebuilds
            onScrollComplete?.();
            await new Promise(r => setTimeout(r, 300));
            onScrollComplete?.();
            await new Promise(r => setTimeout(r, 500));
            onScrollComplete?.();

            this.state.isLoading = false;
            this.state.isLoaded = true;
            return this.state.size;
        }

        waitForScrollTop() {
            return new Promise(resolve => {
                let checks = 0;
                const maxChecks = 50;

                const checkScroll = () => {
                    checks++;
                    if (window.scrollY === 0 || checks >= maxChecks) {
                        setTimeout(resolve, 300);
                    } else {
                        setTimeout(checkScroll, 50);
                    }
                };

                setTimeout(checkScroll, 100);
            });
        }
    }

    class Filter {
        constructor(state) { this.state = state; }

        apply(query) {
            const q = query?.toLowerCase().trim() || '';
            const items = DOM.getListItems();
            let shown = 0, hidden = 0;

            items.forEach(el => {
                const name = DOM.getItemName(el).toLowerCase();
                if (!q || name.includes(q)) {
                    DOM.show(el);
                    shown++;
                } else {
                    DOM.hide(el);
                    hidden++;
                }
            });

            console.log(`[YDS] Filter applied: query="${q}", total=${items.length}, shown=${shown}, hidden=${hidden}`);
        }
    }

    class CopyLinkHandler {
        constructor() {
            this.init();
        }

        init() {
            // Add copy buttons to existing items
            this.addCopyButtons();

            // Watch for new items
            const observer = new MutationObserver(() => this.addCopyButtons());
            const listing = document.querySelector('.listing__items, .listing');
            if (listing) {
                observer.observe(listing, { childList: true, subtree: true });
            }
        }

        addCopyButtons() {
            DOM.getListItems().forEach(item => {
                if (item.querySelector('.yds-copy-btn')) return;

                const titleEl = item.querySelector(CONFIG.selectors.itemTitle);
                if (!titleEl) return;

                const name = titleEl.textContent?.trim();
                if (!name) return;

                const btn = document.createElement('button');
                btn.className = 'yds-copy-btn';
                btn.title = 'Копировать ссылку';
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>`;

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Construct URL from current page + item name
                    const url = `${window.location.origin}${window.location.pathname}/${encodeURIComponent(name)}`;
                    this.copyLink(url, btn);
                });

                item.style.position = 'relative';
                item.appendChild(btn);
            });
        }

        async copyLink(url, btn) {
            try {
                // Get direct download link
                const directUrl = this.getDirectLink(url);
                await navigator.clipboard.writeText(directUrl);

                btn.classList.add('copied');
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>`;

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>`;
                }, 1500);
            } catch (err) {
                console.error('[YDS] Copy failed:', err);
            }
        }

        getDirectLink(url) {
            // Convert Yandex Disk preview URL to direct download URL
            // Example: https://disk.yandex.ru/d/xxx -> https://disk.yandex.ru/d/xxx?download=1
            if (url.includes('disk.yandex.ru')) {
                const urlObj = new URL(url);
                urlObj.searchParams.set('download', '1');
                return urlObj.toString();
            }
            return url;
        }
    }

    class SearchUI {
        constructor(state, harvester, filter) {
            this.state = state;
            this.harvester = harvester;
            this.filter = filter;
            this.el = {};
            this.modalObserver = null;
        }

        injectStyles() {
            if (document.getElementById('yds-styles')) return;
            const style = document.createElement('style');
            style.id = 'yds-styles';
            style.textContent = styles;
            document.head.appendChild(style);
        }

        create() {
            if (document.getElementById('yds-search-bar')) return false;
            this.injectStyles();

            const bar = document.createElement('div');
            bar.id = 'yds-search-bar';
            bar.innerHTML = `
                <div class="yds-inner">
                    <div class="yds-search-wrapper">
                        <input type="text" id="yds-input" placeholder="Поиск по файлам..." autocomplete="off">
                        <svg class="yds-icon-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <button id="yds-clear" type="button" title="Очистить (Esc)">✕</button>
                        <div id="yds-progress"></div>
                    </div>
                    <div class="yds-stats">
                        <div class="yds-spinner" id="yds-spinner"></div>
                        <span id="yds-counter">—</span>
                        <span class="yds-kbd">⌘F</span>
                    </div>
                </div>
                <div id="yds-status"></div>
            `;

            // Start hidden without animation
            bar.classList.add('yds-hidden', 'yds-instant');

            document.body.prepend(bar);
            document.body.classList.add('yds-page-offset');

            this.el = {
                bar,
                input: document.getElementById('yds-input'),
                clear: document.getElementById('yds-clear'),
                counter: document.getElementById('yds-counter'),
                progress: document.getElementById('yds-progress'),
                status: document.getElementById('yds-status'),
                spinner: document.getElementById('yds-spinner')
            };

            this.bindEvents();
            this.updateCounter();

            // Check viewer and show bar after short delay
            setTimeout(() => {
                if (!this.isViewerVisible()) {
                    bar.classList.remove('yds-hidden');
                }
                // Enable animations after initial state is set
                setTimeout(() => bar.classList.remove('yds-instant'), 50);
            }, 100);

            return true;
        }

        isViewerVisible() {
            const viewer = document.querySelector(CONFIG.selectors.imageViewer);
            if (!viewer) return false;

            const style = window.getComputedStyle(viewer);
            const hasSize = viewer.offsetWidth > 0 && viewer.offsetHeight > 0;
            const isDisplayed = style.display !== 'none';
            const isVisible = style.visibility !== 'hidden';
            const hasOpacity = parseFloat(style.opacity) > 0;

            return hasSize && isDisplayed && isVisible && hasOpacity;
        }

        bindEvents() {
            const { input, clear } = this.el;

            input.addEventListener('input', () => this.handleSearch());
            input.addEventListener('keydown', e => {
                if (e.key === 'Escape') this.clearSearch();
            });

            clear.addEventListener('click', () => {
                this.clearSearch();
                input.focus();
            });

            document.addEventListener('keydown', e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    input.focus();
                    input.select();
                }
            });

            let scrollTimer;
            window.addEventListener('scroll', () => {
                if (!this.state.currentQuery) return;
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => this.filter.apply(this.state.currentQuery), CONFIG.debounce.scroll);
            }, { passive: true });

            this.startModalObserver();
        }

        startModalObserver() {
            let checkTimeout = null;

            const checkViewer = () => {
                clearTimeout(checkTimeout);
                checkTimeout = setTimeout(() => {
                    const shouldHide = this.isViewerVisible();
                    this.el.bar.classList.toggle('yds-hidden', shouldHide);
                }, 150);
            };

            this.modalObserver = new MutationObserver(checkViewer);
            this.modalObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Observe listing container for virtual scroll changes
            this.startListingObserver();
        }

        startListingObserver() {
            let filterTimeout = null;
            // Observe .listing__items (direct parent of listing-item elements)
            const listingItems = document.querySelector('.listing__items') ||
                document.querySelector(CONFIG.selectors.listing);
            if (!listingItems) return;

            this.listingObserver = new MutationObserver(() => {
                if (!this.state.currentQuery || this.state.isLoading) return;
                clearTimeout(filterTimeout);
                filterTimeout = setTimeout(() => {
                    this.filter.apply(this.state.currentQuery);
                }, 50);
            });
            this.listingObserver.observe(listingItems, { childList: true });
        }

        async handleSearch() {
            const query = this.el.input.value.trim();
            this.el.clear.classList.toggle('visible', query.length > 0);

            // Set currentQuery BEFORE loading
            this.state.currentQuery = query.toLowerCase().trim();

            if (query && !this.state.isLoaded && !this.state.isLoading) {
                await this.loadAll();

                // Re-harvest to ensure all items are in the Map
                this.harvester.harvest();

                // Restart listing observer (container may have been recreated)
                this.listingObserver?.disconnect();
                this.startListingObserver();

                // Continuously apply filter for 2 seconds to catch all virtual scroll DOM rebuilds
                console.log('[YDS] Starting continuous filter application...');
                await this.applyFilterContinuously(2000);
                console.log('[YDS] Continuous filter complete');
            }

            // IMPORTANT: Use CURRENT input value, not the stale 'query' from start of function
            const currentQuery = this.el.input.value.trim();
            this.state.currentQuery = currentQuery.toLowerCase().trim();
            const result = this.state.search(currentQuery);
            this.filter.apply(currentQuery);
            this.updateCounter(result);
        }

        // Apply filter continuously using RAF for specified duration (uses CURRENT input value)
        applyFilterContinuously(durationMs) {
            return new Promise(resolve => {
                const startTime = Date.now();
                let frameCount = 0;

                const applyFrame = () => {
                    const elapsed = Date.now() - startTime;
                    if (elapsed >= durationMs) {
                        console.log(`[YDS] Applied filter ${frameCount} times over ${elapsed}ms`);
                        resolve();
                        return;
                    }

                    // Always use CURRENT input value
                    const q = this.el.input.value.toLowerCase().trim();
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
            const { progress, spinner, status } = this.el;

            // Helper to get CURRENT query from input (reactive to user typing)
            const getCurrentQuery = () => this.el.input.value.toLowerCase().trim();

            spinner.classList.add('visible');
            progress.classList.add('active');
            status.classList.add('visible');

            try {
                await this.harvester.loadAll(
                    // onProgress - update counter with CURRENT query
                    (count) => {
                        const q = getCurrentQuery();
                        status.textContent = `Загружено ${count} файлов...`;
                        if (q) {
                            const matches = this.state.search(q).matches;
                            this.el.counter.innerHTML = `<span class="yds-match">${matches}</span> из ${count}`;
                        } else {
                            this.el.counter.innerHTML = `${count} файлов`;
                        }
                    },
                    // onScrollComplete - apply CURRENT query
                    () => {
                        const q = getCurrentQuery();
                        if (q) {
                            this.state.currentQuery = q;
                            this.filter.apply(q);
                        }
                    },
                    // onFilter - apply CURRENT query during each scroll step
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
                    spinner.classList.remove('visible');
                    progress.classList.remove('active');
                    status.classList.remove('visible');
                }, 200);
            }
        }

        updateCounter(result) {
            if (!result) {
                this.harvester.harvest();
                this.el.counter.innerHTML = `${this.state.size} файлов`;
                return;
            }

            if (result.query) {
                this.el.counter.innerHTML = `<span class="yds-match">${result.matches}</span> из ${result.total}`;
            } else {
                this.el.counter.innerHTML = `${result.total} файлов`;
            }
        }

        clearSearch() {
            this.el.input.value = '';
            this.el.clear.classList.remove('visible');
            this.filter.apply('');
            this.state.currentQuery = '';
            this.updateCounter({ matches: this.state.size, total: this.state.size, query: '' });
        }

        destroy() {
            this.modalObserver?.disconnect();
            this.listingObserver?.disconnect();
            document.getElementById('yds-search-bar')?.remove();
            document.getElementById('yds-styles')?.remove();
            document.body.classList.remove('yds-page-offset');
        }
    }

    class YandexDiskSearch {
        constructor() {
            this.state = new StateManager();
            this.harvester = new ItemHarvester(this.state);
            this.filter = new Filter(this.state);
            this.ui = new SearchUI(this.state, this.harvester, this.filter);
            this.copyHandler = null;
        }

        init() {
            if (!/\/(d|i)\//.test(location.pathname)) return;

            const timer = setInterval(() => {
                if (document.querySelector(CONFIG.selectors.listItem)) {
                    clearInterval(timer);
                    this.ui.create();
                    this.copyHandler = new CopyLinkHandler();
                    console.log(`[YDS] v${CONFIG.version} ready`);
                }
            }, 150);

            setTimeout(() => clearInterval(timer), 15000);
        }

        reset() {
            this.ui.destroy();
            this.state.reset();
        }
    }

    const app = new YandexDiskSearch();
    window.__YandexDiskSearch = app;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            app.reset();
            setTimeout(() => app.init(), 500);
        }
    }).observe(document, { subtree: true, childList: true });

})();
