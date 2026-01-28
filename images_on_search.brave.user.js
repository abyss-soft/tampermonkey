// ==UserScript==
// @name         Images on search.brave.com
// @namespace    Images-on-search.brave
// @version      0.1
// @description  Images on search.brave.com
// @author       github.com/abyss-soft
// @grant        none
// @include      https://search.brave.com/*
// @updateURL    https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/images_on_search.brave.user.js
// @downloadURL  https://raw.githubusercontent.com/abyss-soft/tampermonkey/main/images_on_search.brave.user.js
// @license MIT
// ==/UserScript==
(function(){
    'use scrict';
    var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function() {
            let wrapperBlockImg = document.getElementById("images-selected-context-menu");
            if(!wrapperBlockImg) return;
            wrapperBlockImg.style.maxWidth ='100%';
            wrapperBlockImg.style.width ='100%';

            let imgSelectedWrapper = wrapperBlockImg.querySelector('.images-selected-image-wrapper');
            if(!imgSelectedWrapper) return;
            imgSelectedWrapper.style.height='90%'
            imgSelectedWrapper.style.maxHeight='90%';

            let imgSelected = imgSelectedWrapper.getElementsByTagName('img');
            if(!imgSelected) return;
            imgSelected[0].style.height='100%';
            imgSelected[0].style.maxHeight='';

            let otherImg = wrapperBlockImg.querySelector('.images-grid');
            if(!otherImg) return;
            otherImg.style.gridTemplateColumns = 'repeat(auto-fit,minmax(0,150px))';
        });
    });


    mutationObserver.observe(document.documentElement, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
})()
