// ==UserScript==
// @name         Yandex_Mail remove ADS + Iframes
// @namespace    mail-yandex-ru
// @version      0.6
// @description  Remove ads and banners from yandex.ru and mail.yandex.ru
// @author       github.com/abyss-soft
// @match        https://mail.yandex.ru/*
// @match        http://mail.yandex.ru/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-remove-ads-in-mail.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-remove-ads-in-mail.user.js
// ==/UserScript==

(function () {
    'use strict';

    function removeAds() {
        // Модальные окна
        const modal = document.querySelector('.Modal');
        if (modal) { modal.style.display = "none"; }

        // Блокировка Роскомнадзора
        document.querySelectorAll('.Warning_type_roskomnadzor').forEach(el => el.style.display = "none");

        // Верхний баннер в почте
        const header = document.querySelector('#js-mail-layout-content-header');
        if (header) {
            header.querySelectorAll('div:not([class])').forEach(el => el.style.display = "none");
            //if (header.children[2])  setTimeout(()=>{
            //header.children[2].style.display="none";
            //},1000)
        }

        // Правая колонка с рекламой в почте
        const right = document.querySelector('div[data-testid^="page-layout_right-column_container_"]');
        if (right) right.style.display = "none";

        const btn = [...document.querySelectorAll('a')]
            .find(el => el.textContent.trim() === 'Отключить рекламу');

        if (btn) {
            const block = btn.closest('div')?.parentElement?.nextElementSibling;
            if (block) {
                block.style.display = 'none';

            }
        }

        // Удаляем рекламные iframe (RTB и пр.)
        document.querySelectorAll('iframe').forEach(frame => {
            if (
                frame.src.includes('an.yandex.ru') ||
                frame.src.includes('ads') ||
                frame.src.includes('doubleclick') ||
                frame.src.includes('banner')
            ) {
                frame.style.display = "none";
            }
        });
    }

    // Убираем сразу
    removeAds();

    //Убираем реклму вверху
    GM_addStyle(`
     div:has(> [data-testid="toolbar-layout_container"])
    > :not([data-testid="toolbar-layout_container"]) {
    display: none !important;}
    `);

    // И следим за изменениями на странице (SPA)
    const observer = new MutationObserver(removeAds);
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();
