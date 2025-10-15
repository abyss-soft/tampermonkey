// ==UserScript==
// @name         Yandex global remove ADS + iframes
// @namespace    yandex-global-remove
// @version      1.3
// @description  Remove advertising banners, blocks, and iframes on Yandex.ru (search, images, etc.)
// @author       github.com/abyss-soft
// @match        https://yandex.ru/*
// @match        http://yandex.ru/*
// @match        https://ya.ru/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-remove-global-ads.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-remove-global-ads.user.js
// ==/UserScript==

//Скрываются рекламные карточки и баннеры.
//Блокируется реклама в правой колонке.
//Удаляются iframe с рекламой от Яндекса, Google и DoubleClick.
//Работает даже при переходах внутри Яндекса (SPA).

(function () {
    'use strict';

    const css = `
        /* Баннеры в Яндекс.Картинках */
        [aria-label="Рекламный баннер"] {
            display: none !important;
        }

        /* Реклама в поиске */
        .serp-item:has([aria-label="Реклама"]),
        .serp-item[data-fast-name="direct"],
        .organic[data-fast-name="direct"] {
            display: none !important;
        }

        /* Реклама в правой колонке */
        .main__right .composite,
        .main__right .Card {
            display: none !important;
        }

        /* Общие рекламные блоки */
        [class*="banner"],
        [class*="Banner"],
        [id*="banner"] {
            display: none !important;
        }

        /*удалим рекламные блоки в картинках ya.ru*/
        const elements = document.querySelectorAll('[data-name="adWrapper"]');
        elements.forEach(el => el.style.display = 'none');


        /* Скрываем рекламные iframe */
        iframe[src*="yandex.ru/ads"],
        iframe[src*="an.yandex.ru"],
        iframe[src*="doubleclick.net"],
        iframe[src*="googlesyndication.com"] {
            display: none !important;
        }
    `;

    function injectCSS() {
        if (!document.getElementById('yandex-ads-remover-style')) {
            const style = document.createElement('style');
            style.id = 'yandex-ads-remover-style';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    injectCSS();

    // Следим за изменениями DOM (SPA-навигация Яндекса)
    const observer = new MutationObserver(() => {
        injectCSS();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
