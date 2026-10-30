// ==UserScript==
// @name         Dzen Ad Killer
// @name:ru      Удаляет рекламу на dzen.ru и sportsdzen.ru
// @name:en      Dzen Ad Killer
// @namespace    https://github.com/abyss-soft/yandex-Dzen-Remove-Ads-and-Banners
// @version      1.0
// @description  Удаляет рекламу и соцрекламу на dzen.ru и sportsdzen.ru
// @description:en Removes advertising and social advertising on dzen.ru and sportsdzen.ru (SPA-friendly, lightweight)
// @author       github.com/abyss-soft
// @match        *://dzen.ru/*
// @match        *://sportsdzen.ru/*
// @match        *://*.dzen.ru/*
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Dzen-Remove-Ads-and-Banners.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/yandex-Dzen-Remove-Ads-and-Banners.user.js
// @license MIT
// ==/UserScript==

(function () {
  'use strict';

  const STYLE_ID = 'yandex-ads-remover-style-dzen';

  const css = `
    /* Общие рекламные баннеры */
    [id*="auto-slide-ad-item"],
    [id*="ad-banner"],
    [class*="dzen-desktop--glif-button"],
    [class^="news-site--glif-button__button"] {
        display: none !important;
    }

    /* Рекламные блоки в ленте новостей */
    #ad-digest_tsar,
    [id^="ad-digest_"],
    [class*="news-site--MyTargetAdvert__ad"],
    [class*="news-mt-advert__banner"] {
        display: none !important;
    }

    /* Рекламные контейнеры Dzen */
    .news-ad-swap-root:has([id^="ad-digest_"]),
    .news-ad-swap-root:has([class*="news-site--MyTargetAdvert__ad"]) {
        display: none !important;
    }
`;

  // Вставляем CSS, даже если head ещё не создан
  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;

    (document.head || document.documentElement)?.appendChild(style);
  }

  // Удаляем рекламные блоки по текстовым меткам
  function removeAdsDeep(root = document) {
    const elements = root.querySelectorAll('div, span, article, a, li');

    for (const el of elements) {
      if (!el.isConnected) continue;

      const text = (el.textContent || '').trim().toLowerCase();

      if (
        text.length >= 50 ||
        !(
          text === 'реклама' ||
          text === 'соцреклама' ||
          text.includes('реклама•') ||
          text.includes('соцреклама•')
        )
      ) {
        continue;
      }

      // Ищем контейнер рекламной карточки
      let target = el;
      let depth = 0;

      while (
        target.parentElement &&
        target.parentElement !== root &&
        depth < 6
      ) {
        const parent = target.parentElement;
        const cls = typeof parent.className === 'string'
          ? parent.className
          : '';

        if (
          parent.tagName === 'ARTICLE' ||
          parent.tagName === 'LI' ||
          cls.includes('card') ||
          cls.includes('item') ||
          cls.includes('desktop--') ||
          parent.children.length <= 4
        ) {
          target = parent;
          break;
        }

        target = parent;
        depth++;
      }

      // Ищем ближайший родительский контейнер misc-card
      let finalTarget = null;
      let current = target;

      while (
        current &&
        current !== document.body &&
        current !== root
      ) {
        for (const attr of current.attributes) {
          if (
            attr.name.startsWith('data-') &&
            attr.value.includes('misc-card')
          ) {
            finalTarget = current;
            break;
          }
        }

        if (finalTarget) break;
        current = current.parentElement;
      }

      // Удаляем карточку целиком, если она найдена
      const victim = finalTarget || target;

      if (
        victim.isConnected &&
        victim !== document.body &&
        victim !== document.documentElement
      ) {
        victim.remove();
      }
    }

    // Обрабатываем Shadow DOM
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT
    );

    let node;

    while ((node = walker.nextNode())) {
      if (node.shadowRoot) {
        removeAdsDeep(node.shadowRoot);
      }
    }
  }

  // Удаляем верхнюю панель и рекламный виджет
  function topPanelRemove() {
    const microRoot = [...document.querySelectorAll('[id$="MicroRoot"]')]
      .find(el =>
        !el.id.includes('LayoutContent') &&
        [...el.attributes].some(a =>
          a.value.includes('dzen-desktop@')
        )
      );

    microRoot?.remove();

    const widget = [...document.querySelectorAll('*')]
      .find(el =>
        [...el.attributes].some(a =>
          a.value === 'opertop-widget'
        )
      );

    widget?.remove();
  }

  // Единая процедура очистки
  function cleanup() {
    injectStyle();
    removeAdsDeep();
    topPanelRemove();
  }

  // Не запускаем несколько очисток в одном кадре
  let scheduled = false;

  function scheduleCleanup() {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      cleanup();
    });
  }

  // Начальная очистка
  cleanup();

  // Очистка после загрузки страницы
  window.addEventListener('DOMContentLoaded', cleanup);
  window.addEventListener('load', cleanup);

  // Отслеживание динамически появляющихся элементов
  const observer = new MutationObserver(scheduleCleanup);

  function startObserver() {
    if (!document.documentElement) return;

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.documentElement) {
    startObserver();
  } else {
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  }

  // Резервная проверка: сохраняем интервал из исходного скрипта
  setInterval(cleanup, 600);

})();