// ==UserScript==
// @name         Rostelecom AD remover
// @namespace    Rostelecom-AD-remover
// @version      0.2
// @description  Rostelecom AD remover
// @author       github.com/abyss-soft
// @match        http://*/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/rostelecom-ads-remover.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/rostelecom-ads-remover.user.js
// ==/UserScript==
(function () {
    'use strict';


    function removeRostelecom() {
        //скрипт для удаления рекламы от Ростелеком, которые она вставляет на сайты с HTTP

        const arrayID = [
            '[id^="large-r-"]',
            '[id^="medium-r-"]',
            '[id^="txtblock-"]'
        ];
        arrayID.forEach(item => {
            const element = document.querySelector(item);
            if (element) {
                element.style.display = "none";
                console.log('Remove: ', element)
            }
        })
    }

    // Слушатель изменений DOM (с debounce для предотвращения лишних срабатываний)
    let timeoutId = null;
    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(removeRostelecom, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Первичный запуск
    removeRostelecom();
})();
