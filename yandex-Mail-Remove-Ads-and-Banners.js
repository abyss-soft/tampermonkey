// ==UserScript==
// @name         Удаляет рекламу в Яндекс Почта и их вставки рекламы в Iframe
// @name:en      Removes Yandex Mail ads and their Iframe insertions
// @namespace    mail-yandex-ru
// @version      0.8
// @description  Removes ads, banners and iframe ads from Yandex Mail (SPA-friendly, lightweight)
// @description:ru Удаляет рекламу и баннеры с Yandex Mail (поддерживает SPA, легковесный) 
// @author       github.com/abyss-soft
// @match        https://mail.yandex.ru/*
// @match        http://mail.yandex.ru/*
// @match        https://mail.yandex.com/*
// @match        http://mail.yandex.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Mail-Remove-Ads-and-Banners.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Mail-Remove-Ads-and-Banners.js
// @license MIT
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle(`
    /* Верхние баннеры */
    div:has(> [data-testid="toolbar-layout_container"])
    > :not([data-testid="toolbar-layout_container"]) {
      display: none !important;
    }

    /* Правая колонка */
    div[data-testid^="page-layout_right-column_container_"] {
      display: none !important;
    }

    /* Роскомнадзор */
    .Warning_type_roskomnadzor,
    .Modal {
      display: none !important;
    }

    /* iframe реклама */
    iframe[src*="an.yandex.ru"],
    iframe[src*="doubleclick"],
    iframe[src*="ads"],
    iframe[src*="banner"] {
      display: none !important;
    }
  `);


  let scheduled = false;

  function removeDynamicAds() {
    scheduled = false;


    const btn = [...document.querySelectorAll('a')]
      .find(a => a.textContent.trim() === 'Отключить рекламу');

    if (btn) {
      const block = btn.closest('div')?.parentElement?.nextElementSibling;
      if (block && !block.dataset.hiddenByScript) {
        block.style.display = 'none';
        block.dataset.hiddenByScript = 'true';
      }
    }
  }

  // debounce
  function scheduleCleanup() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(removeDynamicAds);
    }
  }

  // Убираем сразу
  removeDynamicAds();

  // наблюдение за SPA
  const observer = new MutationObserver(scheduleCleanup);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
