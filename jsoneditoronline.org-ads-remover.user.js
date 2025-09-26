// ==UserScript==
// @name         jsoneditoronline.org AD remover
// @namespace    jsoneditoronline.org-AD-remover
// @version      0.1
// @description  jsoneditoronline.org AD remover
// @author       github.com/abyss-soft
// @grant        none
// @include      https://jsoneditoronline.org/*
// @updateURL    https://github.com/abyss-soft/tampermonkey/blob/main/jsoneditoronline.org-ads-remover.user.js
// @downloadURL  https://github.com/abyss-soft/tampermonkey/blob/main/jsoneditoronline.org-ads-remover.user.js
// ==/UserScript==
(function(){
	'use scrict';
	setTimeout(()=>{
    document.querySelector('.ad-panel').style.display="none";
    document.querySelector('.subscribe-promo-text').style.display="none";
    },2000)

})()
