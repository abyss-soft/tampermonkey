// ==UserScript==
// @name         Yandex Mail - Remove Ads & Iframes
// @name:ru      Яндекс Почта - Удаление рекламы
// @name:en      Yandex Mail - Remove Ads & Iframes
// @namespace    https://github.com/abyss-soft/yandex-Mail-Remove-Ads-and-Banners
// @version      1.0
// @description  Удаляет рекламу и баннеры с Yandex Mail (поддерживает SPA, легковесный)
// @description:en Removes ads, banners and iframe ads from Yandex Mail (SPA-friendly, lightweight)
// @author       github.com/abyss-soft
// @match        https://mail.yandex.ru/*
// @match        http://mail.yandex.ru/*
// @match        https://mail.yandex.com/*
// @match        http://mail.yandex.com/*
// @grant        GM_addStyle
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Mail-Remove-Ads-and-Banners.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Mail-Remove-Ads-and-Banners.user.js
// @license MIT
// ==/UserScript==


(function () {
  'use strict';

  const css = `
   /* Правая колонка */
    div[data-testid^="page-layout_right-column_"] {
      display: none !important;
    }

    /* Роскомнадзор */
    .Warning_type_roskomnadzor {
      display: none !important;
    }

    /* iframe реклама */
    iframe[src*="an.yandex.ru"],
    iframe[src*="doubleclick"],
    iframe[src*="ads"],
    iframe[src*="banner"] {
      display: none !important;
    }
    `;


  let scheduled = false;

  function injectStyle() {
    if (document.getElementById('ymail-remove-ads-style')) return;

    const style = document.createElement('style');
    style.id = 'ymail-remove-ads-style';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  function removeDynamicAds() {
    const btn = [...document.querySelectorAll('a')]
      .find(a => a.textContent.trim() === 'Отключить рекламу');

    if (btn) {
      const block = btn.closest('div')?.parentElement?.nextElementSibling;
      if (block && !block.dataset.hiddenByScript) {
        block.style.display = 'none';
        block.dataset.hiddenByScript = 'true';
      }
    }

    /* Верхние баннеры */
    document.querySelectorAll('[id*="js-messages-direct"]').forEach(el => {
      const parent = el.parentElement;
      if (parent && !parent.dataset.hiddenByScript) {
        parent.style.display = 'none';
        parent.dataset.hiddenByScript = 'true';
      }
    });

  }

  // debounce
  function scheduleCleanup() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        injectStyle();
        removeDynamicAds();
      });
    }
  }

  // Убираем сразу
  injectStyle();
  removeDynamicAds();

  // наблюдение за SPA
  const observer = new MutationObserver(scheduleCleanup);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
