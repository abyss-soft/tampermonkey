// ==UserScript==
// @name         Search Engine Switcher
// @name:ru      Переключатель поисковых систем
// @namespace    https://github.com/abyss-soft/Search-Engine-Switcher
// @version      1.3.1
// @description  Adds quick links to other search engines (Google, Yandex, Bing, DuckDuckGo) on search result pages
// @description:ru Добавляет быстрые ссылки на другие поисковые системы (Яндекс, Google, Bing, DuckDuckGo) на страницах результатов поиска
// @author       abyss-soft
// @license      MIT
// @icon         https://www.google.com/favicon.ico
// @homepageURL  https://github.com/abyss-soft/tampermonkey
// @supportURL   https://github.com/abyss-soft/tampermonkey/issues
// @match        https://www.google.ru/*
// @match        https://www.google.com/*
// @match        https://yandex.ru/*
// @match        https://yandex.com/*
// @match        http://yandex.com/*
// @match        http://yandex.ru/*
// @match        https://ya.ru/*
// @match        https://duckduckgo.com/*
// @match        https://*.bing.com/*
// @grant        none
// @run-at       document-end
// @noframes
// ==/UserScript==

(function () {
    'use strict';

    const HOST = location.hostname;
    let lastQuery = '';

    const ENGINES = [
        { name: 'Google', host: 'google', buildUrl: q => `https://www.google.com/search?q=${q}` },
        { name: 'Яндекс', host: 'yandex', buildUrl: q => `https://yandex.ru/search/?text=${q}` },
        { name: 'Bing', host: 'bing', buildUrl: q => `https://www.bing.com/search?q=${q}` },
        { name: 'DuckDuckGo', host: 'duckduckgo', buildUrl: q => `https://duckduckgo.com/?q=${q}` }
    ];

    function getSearchQuery() {
        const params = new URLSearchParams(window.location.search);
        if (HOST.includes('google') || HOST.includes('duckduckgo')) return params.get('q') || '';
        if (HOST.includes('yandex') || HOST.includes('ya.ru')) return params.get('text') || '';
        if (HOST.includes('bing')) return params.get('q') || document.querySelector('input[type="search"]')?.value || '';
        return '';
    }

    function getMountPoint() {
        // Логика поиска контейнера для Яндекса
        if (HOST.includes('yandex') || HOST.includes('ya.ru')) {
            // 1. Пробуем старый блок поисковых систем
            const yandexEnginesBlock = document.querySelector('.SerpFooter-LinksGroup_type_searchengines');
            if (yandexEnginesBlock) {
                return { container: yandexEnginesBlock, method: 'append', cleanTarget: true };
            }

            // 2. Если блока нет, ищем любой доступный футер (SerpFooter, main footer, etc.)
            const mainFooter = document.querySelector('.SerpFooter') ||
                document.querySelector('.serp-footer') ||
                document.querySelector('footer');

            if (mainFooter) {
                return { container: mainFooter, method: 'prepend', cleanTarget: false };
            }

            // 3. Крайний фоллбек — вставить под список результатов поиска
            const mainContent = document.querySelector('#matrix') || document.querySelector('.main__content');
            if (mainContent) {
                return { container: mainContent, method: 'append', cleanTarget: false };
            }
        }

        if (HOST.includes('google')) {
            const footer = document.querySelector('footer') || document.querySelector('[role="contentinfo"]');
            const helpLink = Array.from(footer?.querySelectorAll('a') || []).find(a => a.href.includes('support.google.com'));
            return helpLink ? { container: helpLink.parentElement, target: helpLink, method: 'insertBefore' } : null;
        }

        if (HOST.includes('duckduckgo') || HOST.includes('bing')) {
            const footer = document.querySelector('footer') || document.querySelector('.footer') || document.querySelector('[role="contentinfo"]');
            return footer ? { container: footer, method: 'prepend' } : null;
        }

        return null;
    }

    function renderLinks() {
        const query = getSearchQuery();
        if (!query) return;

        const mount = getMountPoint();
        if (!mount || !mount.container) return;

        // Если элемент уже вставлен и запрос не менялся — пропускаем
        const existingBlock = document.querySelector('[data-custom-search-links]');
        if (existingBlock && lastQuery === query) return;

        lastQuery = query;
        const encodedQuery = encodeURIComponent(query);

        existingBlock?.remove();

        // Очищаем оригинальные ссылки Яндекса, только если встраиваемся в родной спец-блок
        if (mount.cleanTarget) {
            mount.container.querySelectorAll('a').forEach(a => a.remove());
        }

        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-custom-search-links', 'true');
        wrapper.style.cssText = `
            display: inline-flex;
            position: relative;
            gap: 12px;
            align-items: center;
            margin: 10px 16px;
            padding: 6px 12px;
            background: rgba(0, 0, 0, 0.04);
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.3;
            font-family: yandex-sans, Arial, sans-serif;
            z-index: 9999;
        `;
        if (HOST.includes('duckduckgo') || HOST.includes('bing')) {
            wrapper.style.cssText = wrapper.style.cssText + 'margin-left:10%;'
        }
        if (HOST.includes('bing')) {
            wrapper.style.cssText = wrapper.style.cssText + 'top:12px;'
        }

        const title = document.createElement('span');
        title.textContent = 'Искать в:';
        title.style.cssText = 'color: #888; font-size: 13px; font-weight: 500;';
        wrapper.appendChild(title);

        ENGINES.forEach(engine => {
            if (HOST.includes(engine.host)) return;

            const link = document.createElement('a');
            link.href = engine.buildUrl(encodedQuery);
            link.textContent = engine.name;
            link.target = '_blank';
            link.style.cssText = 'color: #222429; text-decoration: none; font-weight: 500; transition: opacity 0.15s;';
            link.onmouseover = () => { link.style.textDecoration = 'underline'; link.style.opacity = '0.7'; };
            link.onmouseout = () => { link.style.textDecoration = 'none'; link.style.opacity = '1'; };

            wrapper.appendChild(link);
        });

        if (mount.method === 'insertBefore') {
            mount.container.insertBefore(wrapper, mount.target);
        } else if (mount.method === 'prepend') {
            mount.container.prepend(wrapper);
        } else {
            mount.container.appendChild(wrapper);
        }
    }

    // Слушатель изменений DOM (с debounce для предотвращения лишних срабатываний)
    let timeoutId = null;
    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(renderLinks, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Первичный запуск
    renderLinks();
})();