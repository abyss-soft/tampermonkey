// ==UserScript==
// @name         Search Engine Switcher
// @name:ru      Переключатель поисковых систем
// @namespace    https://github.com/abyss-soft/Search-Engine-Switcher
// @version      1.2.1
// @description  Adds quick links to other search engines (Google, Yandex, Bing, DuckDuckGo) on search result pages
// @description:ru Добавляет быстрые ссылки на другие поисковые системы (Яндекс, Google, Bing, DuckDuckGo) на страницах результатов поиска
// @author       abyss-soft
// @license      MIT
// @icon         https://www.google.com/favicon.ico
// @homepageURL  https://github.com/abyss-soft/Search-Engine-Switcher
// @supportURL   https://github.com/abyss-soft/Search-Engine-Switcher/issues
// @match        https://www.google.ru/*
// @match        https://www.google.com/*
// @match        https://yandex.ru/*
// @match        https://yandex.com/*
// @match        http://yandex.com/*
// @match        http://yandex.ru/*
// @match        https://ya.ru/*
// @match        https://duckduckgo.com/*
// @grant        none
// @run-at       document-end
// @noframes
// @downloadURL https://update.greasyfork.org/scripts/564918/Search%20Engine%20Switcher.user.js
// @updateURL https://update.greasyfork.org/scripts/564918/Search%20Engine%20Switcher.meta.js
// ==/UserScript==

(function () {
    'use strict';

    let lastSearchTerm = '';
    let yandexLinksAdded = false;
    let googleLinksAdded = false;
    let duckduckgoLinksAdded = false;

    // Получаем текст поиска
    function getSearchTerm() {
        if (location.hostname.includes('google')) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('q') || '';
        } else if (location.hostname.includes('yandex') || location.hostname.includes('ya.ru')) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('text') || '';
        } else if (location.hostname.includes('duckduckgo')) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('q') || '';
        }
        return '';
    }

    // Добавляем ссылки для Яндекса
    function addYandexLinks() {
        const searchEngineBlock = document.querySelector('.SerpFooter-LinksGroup_type_searchengines');
        if (!searchEngineBlock) {
            console.log('❌ Яндекс: не найден блок с ссылками на поисковые системы');
            return false;
        }

        const searchTerm = getSearchTerm();
        if (!searchTerm) {
            console.log('⚠️ Яндекс: не найден поисковый запрос');
            return false;
        }

        // Проверяем, что ссылки еще не добавлены
        if (yandexLinksAdded && lastSearchTerm === searchTerm) {
            console.log('ℹ️ Яндекс: ссылки уже добавлены для этого запроса');
            return false;
        }

        lastSearchTerm = searchTerm;
        yandexLinksAdded = true;

        // Удаляем старые ссылки
        const existingLinks = searchEngineBlock.querySelectorAll('[data-custom-search-link]');
        existingLinks.forEach(link => link.remove());
        const oldBing = document.querySelector('a[href^="//www.bing.com/search?q="]');
        if (oldBing) oldBing.remove();
        const oldGoogle = document.querySelector('a[href^="//www.google.ru/search?"]');
        if (oldGoogle) oldGoogle.remove();

        // Создаем новые ссылки
        const searchEngines = [
            { name: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}` },
            { name: 'Bing', url: `https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}` },
            { name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}` }
        ];

        searchEngines.forEach((engine, index) => {
            const link = document.createElement('a');
            link.href = engine.url;
            link.textContent = engine.name;
            link.setAttribute('data-custom-search-link', 'true');
            link.setAttribute('target', '_blank');
            link.style.cssText = `
                color: #5f6368;
                text-decoration: none;
                display: flex;
                align-items: center;
                margin-left: 18px;
                line-height: 1.3;
                text-decoration: none;
                font-family: Arial, sans-serif;
            `;
            link.onmouseover = function () {
                this.style.textDecoration = 'underline';
            };
            link.onmouseout = function () {
                this.style.textDecoration = 'none';
            };
            searchEngineBlock.appendChild(link);
        });

        console.log('✅ Яндекс: добавлены ссылки на поисковые системы');
        return true;
    }

    // Добавляем ссылки для Google
    function addGoogleLinks() {
        const footer = document.querySelector('footer') ||
            document.querySelector('[role="contentinfo"]') ||
            document.querySelector('[jsname="U8b5nd"]');

        if (!footer) {
            console.log('❌ Google: не найден футер');
            return false;
        }

        const helpLink = Array.from(footer.querySelectorAll('a')).find(link => {
            const text = link.textContent.trim();
            const href = link.getAttribute('href') || '';
            return (text === 'Справка' || text === 'Help') && href.includes('support.google.com');
        });

        if (!helpLink) {
            console.log('❌ Google: не найдена ссылка "Справка" или "Help"');
            return false;
        }

        const searchTerm = getSearchTerm();
        if (!searchTerm) {
            console.log('⚠️ Google: не найден поисковый запрос');
            return false;
        }

        // Проверяем, что ссылки еще не добавлены
        if (googleLinksAdded && lastSearchTerm === searchTerm) {
            console.log('ℹ️ Google: ссылки уже добавлены для этого запроса');
            return false;
        }

        lastSearchTerm = searchTerm;
        googleLinksAdded = true;

        // Удаляем старые ссылки
        const existingContainer = document.querySelector('[data-custom-search-links]');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Создаем блок для новых ссылок
        const newLinksContainer = document.createElement('div');
        newLinksContainer.setAttribute('data-custom-search-links', 'true');
        newLinksContainer.style.cssText = `
            display: inline-block;
            margin-right: 10px;
            margin-left: 8px;
        `;
        newLinksContainer.innerHTML = `
            <a href="https://yandex.ru/search/?text=${encodeURIComponent(searchTerm)}" style="color: #5f6368; text-decoration: none; font-size: 14px; line-height: 1.3; font-family: Arial, sans-serif;" target="_blank">Яндекс</a>
            <span style="color: #5f6368; margin: 0 3px; line-height: 1.3; font-family: Arial, sans-serif;">|</span>
            <a href="https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}" style="color: #5f6368; text-decoration: none; font-size: 14px; line-height: 1.3; font-family: Arial, sans-serif;" target="_blank">Bing</a>
            <span style="color: #5f6368; margin: 0 3px; line-height: 1.3; font-family: Arial, sans-serif;">|</span>
            <a href="https://duckduckgo.com/?q=${encodeURIComponent(searchTerm)}" style="color: #5f6368; text-decoration: none; font-size: 14px; line-height: 1.3; font-family: Arial, sans-serif;" target="_blank">DuckDuckGo</a>
        `;

        // Добавляем обработчики наведения
        newLinksContainer.querySelectorAll('a').forEach(link => {
            link.onmouseover = function () {
                this.style.textDecoration = 'underline';
                this.style.color = '#1a0dab';
            };
            link.onmouseout = function () {
                this.style.textDecoration = 'none';
                this.style.color = '#5f6368';
            };
        });

        // Вставляем перед ссылкой "Справка"
        helpLink.parentElement.insertBefore(newLinksContainer, helpLink);

        console.log('✅ Google: добавлены ссылки на поисковые системы');
        return true;
    }

    // Добавляем ссылки для DuckDuckGo
    function addDuckDuckGoLinks() {
        // Ищем футер на DuckDuckGo
        const footer = document.querySelector('.footer') ||
            document.querySelector('footer') ||
            document.querySelector('[role="contentinfo"]');

        if (!footer) {
            console.log('❌ DuckDuckGo: не найден футер');
            return false;
        }

        const searchTerm = getSearchTerm();
        if (!searchTerm) {
            console.log('⚠️ DuckDuckGo: не найден поисковый запрос');
            return false;
        }

        // Проверяем, что ссылки еще не добавлены
        if (duckduckgoLinksAdded && lastSearchTerm === searchTerm) {
            console.log('ℹ️ DuckDuckGo: ссылки уже добавлены для этого запроса');
            return false;
        }

        lastSearchTerm = searchTerm;
        duckduckgoLinksAdded = true;

        // Удаляем старые ссылки
        const existingContainer = document.querySelector('[data-custom-search-links]');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Создаем блок для новых ссылок
        const newLinksContainer = document.createElement('div');
        newLinksContainer.setAttribute('data-custom-search-links', 'true');
        newLinksContainer.style.cssText = `
            display: flex;
            gap: 12px;
            padding: 12px 0;
            border-top: 1px solid #e4e4e4;
            margin-top: 12px;
            font-size: 14px;
            line-height: 1.5;
            margin-left: 10%;
        `;
        newLinksContainer.innerHTML = `
            <span style="color: #717171; font-weight: 500;">Другие поисковики:</span>
            <a href="https://yandex.ru/search/?text=${encodeURIComponent(searchTerm)}" style="color: #717171; text-decoration: none;" target="_blank">Яндекс</a>
            <a href="https://www.google.com/search?q=${encodeURIComponent(searchTerm)}" style="color: #717171; text-decoration: none;" target="_blank">Google</a>
            <a href="https://www.bing.com/search?q=${encodeURIComponent(searchTerm)}" style="color: #717171; text-decoration: none;" target="_blank">Bing</a>
        `;

        // Добавляем обработчики наведения
        newLinksContainer.querySelectorAll('a').forEach(link => {
            link.onmouseover = function () {
                this.style.textDecoration = 'underline';
                this.style.color = '#227eda';
            };
            link.onmouseout = function () {
                this.style.textDecoration = 'none';
                this.style.color = '#717171';
            };
        });

        // Добавляем в футер
        footer.prepend(newLinksContainer);

        console.log('✅ DuckDuckGo: добавлены ссылки на поисковые системы');
        return true;
    }

    // Проверка и добавление ссылок
    function checkAndAddLinks() {
        const isGoogle = location.hostname.includes('google');
        const isYandex = location.hostname.includes('yandex') || location.hostname.includes('ya.ru');
        const isDuckDuckGo = location.hostname.includes('duckduckgo');

        // Проверяем, что это страница поиска
        const isGoogleSearch = isGoogle && location.pathname.includes('/search');
        const isYandexSearch = isYandex && (location.search.includes('text=') || location.pathname === '/search/');
        const isDuckDuckGoSearch = isDuckDuckGo && location.search.includes('q=');

        if (!isGoogleSearch && !isYandexSearch && !isDuckDuckGoSearch) {
            return;
        }

        if (isYandexSearch) {
            addYandexLinks();
        } else if (isGoogleSearch) {
            addGoogleLinks();
        } else if (isDuckDuckGoSearch) {
            addDuckDuckGoLinks();
        }
    }

    // Наблюдатель для Яндекса
    function initYandexObserver() {
        const observer = new MutationObserver(() => {
            const searchEngineBlock = document.querySelector('.SerpFooter-LinksGroup_type_searchengines');
            if (searchEngineBlock) {
                checkAndAddLinks();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Наблюдатель для Google
    function initGoogleObserver() {
        const observer = new MutationObserver(() => {
            const footer = document.querySelector('footer');
            if (footer && footer.querySelector('a[href*="support.google.com"]')) {
                checkAndAddLinks();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Наблюдатель для DuckDuckGo
    function initDuckDuckGoObserver() {
        const observer = new MutationObserver(() => {
            const footer = document.querySelector('footer');
            if (footer && location.search.includes('q=')) {
                checkAndAddLinks();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Инициализация
    function init() {
        // Сначала проверяем, есть ли элементы
        if (document.querySelector('.SerpFooter-LinksGroup_type_searchengines')) {
            checkAndAddLinks();
        } else if (location.hostname.includes('yandex') || location.hostname.includes('ya.ru')) {
            initYandexObserver();
        }

        if (document.querySelector('footer') && document.querySelector('footer a[href*="support.google.com"]')) {
            checkAndAddLinks();
        } else if (location.hostname.includes('google')) {
            initGoogleObserver();
        }

        if (document.querySelector('footer') && location.hostname.includes('duckduckgo')) {
            checkAndAddLinks();
        } else if (location.hostname.includes('duckduckgo')) {
            initDuckDuckGoObserver();
        }

        // Проверка каждые 2 секунды на случай, если элементы появятся позже
        setInterval(() => {
            if (!yandexLinksAdded || !googleLinksAdded || !duckduckgoLinksAdded) {
                checkAndAddLinks();
            }
        }, 2000);
    }

    // Запуск
    setTimeout(init, 1000);
})();