(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{2:function(n,e,o){o("OmL/"),n.exports=o("d5MC")},HCrD:function(n,e,o){"use strict";o.r(e);var t=o("JPst"),r=o.n(t)()(!1);r.push([n.i,':root {\n    --header-height: 24px;\n    --header-border-size: 1px;\n    --header-background-color: white;\n    --header-vertical-padding: 4px;\n    --header-font-size: 18px;\n    --heading-size: calc(var(--header-vertical-padding) * 2 + var(--header-font-size) + var(--header-border-size));\n}\n\n#gm-menu-container {\n    display: grid;\n    z-index: 12;\n    width: 100%;\n    position: fixed;\n    top: 0px;\n    grid-template-rows: repeat(1, var(--heading-size));\n    border-bottom: solid 1px black;\n    background-color: white;\n    font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n    font-size: var(--header-font-size);\n}\n\n.gm-menu {\n    padding-bottom: var(--header-vertical-padding);\n    padding-top: var(--header-vertical-padding);\n}\n\n.gm-menu:nth-of-type(1) {\n    margin-left: 20px;\n}\n\n/* [class*="menu-item"]:hover,\n.gm-menu:hover  */\n\n.menu-item-hover\n{\n    color: white !important;\n    background-color: black !important;\n    cursor: pointer !important;\n}\n\n[class*="gm-menu"],\n[class*="gm-sub-menu-item"],\n[class*="gm-child-menu-item"] {\n    text-align: left;\n    padding-left: 10px;\n    padding-right: 10px;\n}\n\n.gm-sub-menu-item,\n.gm-child-menu-item {\n    background-color: white;\n    color: black;\n    border-right: solid black 1px;\n    padding-bottom: var(--header-vertical-padding);\n    padding-top: var(--header-vertical-padding);\n}\n\n.gm-disabled{\n    color: lightgray;\n}\n\n.gm-sub-menu-item {\n    border-left: solid black 1px;\n}\n\n.gm-sub-menu-container {\n    display: grid;\n    z-index: -1;\n    position: fixed;\n    font-family: -apple-system, BlinkMacSystemFont, sans-serif;\n    font-size: var(--header-font-size);\n}\n\n.gm-hidden {\n    visibility: hidden;\n}\n\n#bodyContent {\n    height: calc(100vh - var(--heading-size));\n    margin-top: var(--heading-size);\n}\n\n#gm-span {\n    display: inline-block;\n    padding-left: 8px;\n    font-size: 8px;\n    padding-top: 4px;\n}',""]),e.default=r},JPst:function(n,e,o){"use strict";n.exports=function(n){var e=[];return e.toString=function(){return this.map((function(e){var o=function(n,e){var o,t,r=n[1]||"",i=n[3];if(!i)return r;if(e&&"function"==typeof btoa){var c=(o=btoa(unescape(encodeURIComponent(JSON.stringify(i)))),t="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(o),"/*# ".concat(t," */")),a=i.sources.map((function(n){return"/*# sourceURL=".concat(i.sourceRoot||"").concat(n," */")}));return[r].concat(a).concat([c]).join("\n")}return[r].join("\n")}(e,n);return e[2]?"@media ".concat(e[2]," {").concat(o,"}"):o})).join("")},e.i=function(n,o,t){"string"==typeof n&&(n=[[null,n,""]]);var r={};if(t)for(var i=0;i<this.length;i++){var c=this[i][0];null!=c&&(r[c]=!0)}for(var a=0;a<n.length;a++){var s=[].concat(n[a]);t&&r[s[0]]||(o&&(s[2]=s[2]?"".concat(o," and ").concat(s[2]):o),e.push(s))}},e}},LboF:function(n,e,o){"use strict";var t,r=function(){var n={};return function(e){if(void 0===n[e]){var o=document.querySelector(e);if(window.HTMLIFrameElement&&o instanceof window.HTMLIFrameElement)try{o=o.contentDocument.head}catch(t){o=null}n[e]=o}return n[e]}}(),i=[];function c(n){for(var e=-1,o=0;o<i.length;o++)if(i[o].identifier===n){e=o;break}return e}function a(n,e){for(var o={},t=[],r=0;r<n.length;r++){var a=n[r],s=e.base?a[0]+e.base:a[0],f=o[s]||0,b="".concat(s," ").concat(f);o[s]=f+1;var d=c(b),l={css:a[1],media:a[2],sourceMap:a[3]};-1!==d?(i[d].references++,i[d].updater(l)):i.push({identifier:b,updater:h(l,e),references:1}),t.push(b)}return t}function s(n){var e=document.createElement("style"),t=n.attributes||{};if(void 0===t.nonce){var i=o.nc;i&&(t.nonce=i)}if(Object.keys(t).forEach((function(n){e.setAttribute(n,t[n])})),"function"==typeof n.insert)n.insert(e);else{var c=r(n.insert||"head");if(!c)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");c.appendChild(e)}return e}var f,b=(f=[],function(n,e){return f[n]=e,f.filter(Boolean).join("\n")});function d(n,e,o,t){var r=o?"":t.media?"@media ".concat(t.media," {").concat(t.css,"}"):t.css;if(n.styleSheet)n.styleSheet.cssText=b(e,r);else{var i=document.createTextNode(r),c=n.childNodes;c[e]&&n.removeChild(c[e]),c.length?n.insertBefore(i,c[e]):n.appendChild(i)}}function l(n,e,o){var t=o.css,r=o.media,i=o.sourceMap;if(r?n.setAttribute("media",r):n.removeAttribute("media"),i&&btoa&&(t+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(i))))," */")),n.styleSheet)n.styleSheet.cssText=t;else{for(;n.firstChild;)n.removeChild(n.firstChild);n.appendChild(document.createTextNode(t))}}var m=null,p=0;function h(n,e){var o,t,r;if(e.singleton){var i=p++;o=m||(m=s(e)),t=d.bind(null,o,i,!1),r=d.bind(null,o,i,!0)}else o=s(e),t=l.bind(null,o,e),r=function(){!function(n){if(null===n.parentNode)return!1;n.parentNode.removeChild(n)}(o)};return t(n),function(e){if(e){if(e.css===n.css&&e.media===n.media&&e.sourceMap===n.sourceMap)return;t(n=e)}else r()}}n.exports=function(n,e){(e=e||{}).singleton||"boolean"==typeof e.singleton||(e.singleton=(void 0===t&&(t=Boolean(window&&document&&document.all&&!window.atob)),t));var o=a(n=n||[],e);return function(n){if(n=n||[],"[object Array]"===Object.prototype.toString.call(n)){for(var t=0;t<o.length;t++){var r=c(o[t]);i[r].references--}for(var s=a(n,e),f=0;f<o.length;f++){var b=c(o[f]);0===i[b].references&&(i[b].updater(),i.splice(b,1))}o=s}}}},"OmL/":function(n,e,o){var t=o("LboF"),r=o("W9N5");"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[n.i,r,""]]),t(r,{insert:"head",singleton:!1}),n.exports=r.locals||{}},W9N5:function(n,e,o){"use strict";o.r(e);var t=o("JPst"),r=o.n(t)()(!1);r.push([n.i,'.emoji-mart,\n.emoji-mart * {\n  box-sizing: border-box;\n  line-height: 1.15;\n}\n\n.emoji-mart {\n  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;\n  font-size: 16px;\n  display: inline-block;\n  color: #222427;\n  border: 1px solid #d9d9d9;\n  border-radius: 5px;\n  background: #fff;\n}\n\n.emoji-mart .emoji-mart-emoji {\n  padding: 6px;\n}\n\n.emoji-mart-bar {\n  border: 0 solid #d9d9d9;\n}\n\n.emoji-mart-bar:first-child {\n  border-bottom-width: 1px;\n  border-top-left-radius: 5px;\n  border-top-right-radius: 5px;\n}\n\n.emoji-mart-bar:last-child {\n  border-top-width: 1px;\n  border-bottom-left-radius: 5px;\n  border-bottom-right-radius: 5px;\n}\n\n.emoji-mart-anchors {\n  display: flex;\n  flex-direction: row;\n  justify-content: space-between;\n  padding: 0 6px;\n  line-height: 0;\n}\n\n.emoji-mart-anchor {\n  position: relative;\n  display: block;\n  flex: 1 1 auto;\n  color: #858585;\n  text-align: center;\n  padding: 12px 4px;\n  overflow: hidden;\n  transition: color .1s ease-out;\n  margin: 0;\n  box-shadow: none;\n  background: none;\n  border: none;\n}\n\n.emoji-mart-anchor:focus { outline: 0 }\n\n.emoji-mart-anchor:hover,\n.emoji-mart-anchor:focus,\n.emoji-mart-anchor-selected {\n  color: #464646;\n}\n\n.emoji-mart-anchor-selected .emoji-mart-anchor-bar {\n  bottom: 0;\n}\n\n.emoji-mart-anchor-bar {\n  position: absolute;\n  bottom: -3px; left: 0;\n  width: 100%; height: 3px;\n  background-color: #464646;\n}\n\n.emoji-mart-anchors i {\n  display: inline-block;\n  width: 100%;\n  max-width: 22px;\n}\n\n.emoji-mart-anchors svg,\n.emoji-mart-anchors img {\n  fill: currentColor;\n  height: 18px;\n  width: 18px;\n}\n\n.emoji-mart-scroll {\n  overflow-y: scroll;\n  height: 270px;\n  padding: 0 6px 6px 6px;\n  will-change: transform; /* avoids "repaints on scroll" in mobile Chrome */\n}\n\n.emoji-mart-search {\n  margin-top: 6px;\n  padding: 0 6px;\n  position: relative;\n}\n\n.emoji-mart-search input {\n  font-size: 16px;\n  display: block;\n  width: 100%;\n  padding: 5px 25px 6px 10px;\n  border-radius: 5px;\n  border: 1px solid #d9d9d9;\n  outline: 0;\n}\n\n.emoji-mart-search input,\n.emoji-mart-search input::-webkit-search-decoration,\n.emoji-mart-search input::-webkit-search-cancel-button,\n.emoji-mart-search input::-webkit-search-results-button,\n.emoji-mart-search input::-webkit-search-results-decoration {\n  /* remove webkit/blink styles for <input type="search">\n   * via https://stackoverflow.com/a/9422689 */\n  -webkit-appearance: none;\n}\n\n.emoji-mart-search-icon {\n  position: absolute;\n  top: 3px;\n  right: 11px;\n  z-index: 2;\n  padding: 2px 5px 1px;\n  border: none;\n  background: none;\n}\n\n.emoji-mart-category .emoji-mart-emoji span {\n  z-index: 1;\n  position: relative;\n  text-align: center;\n  cursor: default;\n}\n\n.emoji-mart-category .emoji-mart-emoji:hover:before {\n  z-index: 0;\n  content: "";\n  position: absolute;\n  top: 0; left: 0;\n  width: 100%; height: 100%;\n  background-color: #f4f4f4;\n  border-radius: 100%;\n}\n\n.emoji-mart-category-label {\n  z-index: 2;\n  position: relative;\n  position: sticky;\n  top: 0;\n}\n\n.emoji-mart-category-label span {\n  display: block;\n  width: 100%;\n  font-weight: 500;\n  padding: 5px 6px;\n  background-color: #fff;\n  background-color: rgba(255, 255, 255, .95);\n}\n\n.emoji-mart-category-list {\n  margin: 0;\n  padding: 0;\n}\n\n.emoji-mart-category-list li {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  display: inline-block;\n}\n\n.emoji-mart-emoji {\n  position: relative;\n  display: inline-block;\n  font-size: 0;\n  margin: 0;\n  padding: 0;\n  border: none;\n  background: none;\n  box-shadow: none;\n}\n\n.emoji-mart-emoji-native {\n  font-family: "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji";\n}\n\n.emoji-mart-no-results {\n  font-size: 14px;\n  text-align: center;\n  padding-top: 70px;\n  color: #858585;\n}\n\n.emoji-mart-no-results .emoji-mart-category-label {\n  display: none;\n}\n\n.emoji-mart-no-results .emoji-mart-no-results-label {\n  margin-top: .2em;\n}\n\n.emoji-mart-no-results .emoji-mart-emoji:hover:before {\n  content: none;\n}\n\n.emoji-mart-preview {\n  position: relative;\n  height: 70px;\n}\n\n.emoji-mart-preview-emoji,\n.emoji-mart-preview-data,\n.emoji-mart-preview-skins {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n.emoji-mart-preview-emoji {\n  left: 12px;\n}\n\n.emoji-mart-preview-data {\n  left: 68px; right: 12px;\n  word-break: break-all;\n}\n\n.emoji-mart-preview-skins {\n  right: 30px;\n  text-align: right;\n}\n\n.emoji-mart-preview-skins.custom {\n  right: 10px;\n  text-align: right;\n}\n\n.emoji-mart-preview-name {\n  font-size: 14px;\n}\n\n.emoji-mart-preview-shortname {\n  font-size: 12px;\n  color: #888;\n}\n\n.emoji-mart-preview-shortname + .emoji-mart-preview-shortname,\n.emoji-mart-preview-shortname + .emoji-mart-preview-emoticon,\n.emoji-mart-preview-emoticon + .emoji-mart-preview-emoticon {\n  margin-left: .5em;\n}\n\n.emoji-mart-preview-emoticon {\n  font-size: 11px;\n  color: #bbb;\n}\n\n.emoji-mart-title span {\n  display: inline-block;\n  vertical-align: middle;\n}\n\n.emoji-mart-title .emoji-mart-emoji {\n  padding: 0;\n}\n\n.emoji-mart-title-label {\n  color: #999A9C;\n  font-size: 26px;\n  font-weight: 300;\n}\n\n.emoji-mart-skin-swatches {\n  font-size: 0;\n  padding: 2px 0;\n  border: 1px solid #d9d9d9;\n  border-radius: 12px;\n  background-color: #fff;\n}\n\n.emoji-mart-skin-swatches.custom {\n  font-size: 0;\n  border: none;\n  background-color: #fff;\n}\n\n.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch {\n  width: 16px;\n  padding: 0 2px;\n}\n\n.emoji-mart-skin-swatches.opened .emoji-mart-skin-swatch.selected:after {\n  opacity: .75;\n}\n\n.emoji-mart-skin-swatch {\n  display: inline-block;\n  width: 0;\n  vertical-align: middle;\n  transition-property: width, padding;\n  transition-duration: .125s;\n  transition-timing-function: ease-out;\n}\n\n.emoji-mart-skin-swatch:nth-child(1) { transition-delay: 0s }\n\n.emoji-mart-skin-swatch:nth-child(2) { transition-delay: .03s }\n\n.emoji-mart-skin-swatch:nth-child(3) { transition-delay: .06s }\n\n.emoji-mart-skin-swatch:nth-child(4) { transition-delay: .09s }\n\n.emoji-mart-skin-swatch:nth-child(5) { transition-delay: .12s }\n\n.emoji-mart-skin-swatch:nth-child(6) { transition-delay: .15s }\n\n.emoji-mart-skin-swatch.selected {\n  position: relative;\n  width: 16px;\n  padding: 0 2px;\n}\n\n.emoji-mart-skin-swatch.selected:after {\n  content: "";\n  position: absolute;\n  top: 50%; left: 50%;\n  width: 4px; height: 4px;\n  margin: -2px 0 0 -2px;\n  background-color: #fff;\n  border-radius: 100%;\n  pointer-events: none;\n  opacity: 0;\n  transition: opacity .2s ease-out;\n}\n\n.emoji-mart-skin-swatch.custom {\n  display: inline-block;\n  width: 0;\n  height: 38px;\n  overflow: hidden;\n  vertical-align: middle;\n  transition-property: width, height;\n  transition-duration: .125s;\n  transition-timing-function: ease-out;\n  cursor: default;\n}\n\n.emoji-mart-skin-swatch.custom.selected {\n  position: relative;\n  width: 36px;\n  height: 38px;\n  padding: 0 2px 0 0;\n}\n\n.emoji-mart-skin-swatch.custom.selected:after {\n  content: "";\n  width: 0;\n  height: 0;\n}\n\n.emoji-mart-skin-swatches.custom .emoji-mart-skin-swatch.custom:hover {\n  background-color: #f4f4f4;\n  border-radius: 10%;\n}\n\n.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom {\n  width: 36px;\n  height: 38px;\n  padding: 0 2px 0 0;\n}\n\n.emoji-mart-skin-swatches.custom.opened .emoji-mart-skin-swatch.custom.selected:after {\n  opacity: .75;\n}\n\n.emoji-mart-skin-text.opened {\n  display: inline-block;\n  vertical-align: middle;\n  text-align: left;\n  color: #888;\n  font-size: 11px;\n  padding: 5px 2px;\n  width: 95px;\n  height: 40px;\n  border-radius: 10%;\n  background-color: #fff;\n}\n\n.emoji-mart-skin {\n  display: inline-block;\n  width: 100%;\n  padding-top: 100%;\n  max-width: 12px;\n  border-radius: 100%;\n}\n\n.emoji-mart-skin-tone-1 { background-color: #ffc93a }\n\n.emoji-mart-skin-tone-2 { background-color: #fadcbc }\n\n.emoji-mart-skin-tone-3 { background-color: #e0bb95 }\n\n.emoji-mart-skin-tone-4 { background-color: #bf8f68 }\n\n.emoji-mart-skin-tone-5 { background-color: #9b643d }\n\n.emoji-mart-skin-tone-6 { background-color: #594539 }\n\n/* For screenreaders only, via https://stackoverflow.com/a/19758620 */\n\n.emoji-mart-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n\n/*\n * Dark mode styles\n */\n\n.emoji-mart-dark {\n  color: #fff;\n  border-color: #555453;\n  background-color: #222;\n}\n\n.emoji-mart-dark .emoji-mart-bar {\n  border-color: #555453;\n}\n\n.emoji-mart-dark .emoji-mart-search input {\n  color: #fff;\n  border-color: #555453;\n  background-color: #2f2f2f;\n}\n\n.emoji-mart-dark .emoji-mart-search-icon svg {\n  fill: #fff;\n}\n\n.emoji-mart-dark .emoji-mart-category .emoji-mart-emoji:hover:before {\n  background-color: #444;\n}\n\n.emoji-mart-dark .emoji-mart-category-label span {\n  background-color: #222;\n  color: #fff;\n}\n\n.emoji-mart-dark .emoji-mart-skin-swatches {\n  border-color: #555453;\n  background-color: #222;\n}\n\n.emoji-mart-dark .emoji-mart-anchor:hover,\n.emoji-mart-dark .emoji-mart-anchor:focus,\n.emoji-mart-dark .emoji-mart-anchor-selected {\n  color: #bfbfbf;\n}\n\n@font-face {\n    font-family: \'icomoon\';\n    src: url(\'icomoon.95a00167d5ba7a268542.woff?h3jxio\') format(\'woff\');\n    font-weight: normal;\n    font-style: normal;\n    font-display: block;\n  }\n\n[class^="icon-"], [class*=" icon-"] {\n    /* use !important to prevent issues with browser extensions that change fonts */\n    font-family: \'icomoon\' !important;\n    speak: never;\n    font-style: normal;\n    font-weight: normal;\n    font-variant: normal;\n    text-transform: none;\n    line-height: 1;\n  \n    /* Better Font Rendering ========== */\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n\n.icon-home:before {\n  content: "\\e900";\n}\n\n.icon-newspaper:before {\n  content: "\\e904";\n}\n\n.icon-pencil:before {\n  content: "\\e905";\n}\n\n.icon-pencil2:before {\n  content: "\\e906";\n}\n\n.icon-eyedropper:before {\n  content: "\\e90a";\n}\n\n.icon-droplet:before {\n  content: "\\e90b";\n}\n\n.icon-paint-format:before {\n  content: "\\e90c";\n}\n\n.icon-image:before {\n  content: "\\e90d";\n}\n\n.icon-images:before {\n  content: "\\e90e";\n}\n\n.icon-camera:before {\n  content: "\\e90f";\n}\n\n.icon-headphones:before {\n  content: "\\e910";\n}\n\n.icon-music:before {\n  content: "\\e911";\n}\n\n.icon-play:before {\n  content: "\\e912";\n}\n\n.icon-film:before {\n  content: "\\e913";\n}\n\n.icon-video-camera:before {\n  content: "\\e914";\n}\n\n.icon-dice:before {\n  content: "\\e915";\n}\n\n.icon-bullhorn:before {\n  content: "\\e91a";\n}\n\n.icon-connection:before {\n  content: "\\e91b";\n}\n\n.icon-mic:before {\n  content: "\\e91e";\n}\n\n.icon-book:before {\n  content: "\\e91f";\n}\n\n.icon-books:before {\n  content: "\\e920";\n}\n\n.icon-library:before {\n  content: "\\e921";\n}\n\n.icon-file-text:before {\n  content: "\\e922";\n}\n\n.icon-profile:before {\n  content: "\\e923";\n}\n\n.icon-file-empty:before {\n  content: "\\e924";\n}\n\n.icon-files-empty:before {\n  content: "\\e925";\n}\n\n.icon-file-text2:before {\n  content: "\\e926";\n}\n\n.icon-file-play:before {\n  content: "\\e929";\n}\n\n.icon-file-zip:before {\n  content: "\\e92b";\n}\n\n.icon-copy:before {\n  content: "\\e92c";\n}\n\n.icon-paste:before {\n  content: "\\e92d";\n}\n\n.icon-stack:before {\n  content: "\\e92e";\n}\n\n.icon-folder:before {\n  content: "\\e92f";\n}\n\n.icon-folder-open:before {\n  content: "\\e930";\n}\n\n.icon-folder-plus:before {\n  content: "\\e931";\n}\n\n.icon-folder-minus:before {\n  content: "\\e932";\n}\n\n.icon-folder-download:before {\n  content: "\\e933";\n}\n\n.icon-folder-upload:before {\n  content: "\\e934";\n}\n\n.icon-price-tag:before {\n  content: "\\e935";\n}\n\n.icon-price-tags:before {\n  content: "\\e936";\n}\n\n.icon-calculator:before {\n  content: "\\e940";\n}\n\n.icon-address-book:before {\n  content: "\\e944";\n}\n\n.icon-envelop:before {\n  content: "\\e945";\n}\n\n.icon-compass:before {\n  content: "\\e949";\n}\n\n.icon-history:before {\n  content: "\\e94d";\n}\n\n.icon-clock:before {\n  content: "\\e94e";\n}\n\n.icon-clock2:before {\n  content: "\\e94f";\n}\n\n.icon-alarm:before {\n  content: "\\e950";\n}\n\n.icon-bell:before {\n  content: "\\e951";\n}\n\n.icon-stopwatch:before {\n  content: "\\e952";\n}\n\n.icon-calendar:before {\n  content: "\\e953";\n}\n\n.icon-printer:before {\n  content: "\\e954";\n}\n\n.icon-keyboard:before {\n  content: "\\e955";\n}\n\n.icon-display:before {\n  content: "\\e956";\n}\n\n.icon-mobile:before {\n  content: "\\e958";\n}\n\n.icon-drawer:before {\n  content: "\\e95c";\n}\n\n.icon-drawer2:before {\n  content: "\\e95d";\n}\n\n.icon-box-add:before {\n  content: "\\e95e";\n}\n\n.icon-box-remove:before {\n  content: "\\e95f";\n}\n\n.icon-download:before {\n  content: "\\e960";\n}\n\n.icon-upload:before {\n  content: "\\e961";\n}\n\n.icon-floppy-disk:before {\n  content: "\\e962";\n}\n\n.icon-drive:before {\n  content: "\\e963";\n}\n\n.icon-database:before {\n  content: "\\e964";\n}\n\n.icon-undo:before {\n  content: "\\e965";\n}\n\n.icon-redo:before {\n  content: "\\e966";\n}\n\n.icon-undo2:before {\n  content: "\\e967";\n}\n\n.icon-redo2:before {\n  content: "\\e968";\n}\n\n.icon-forward:before {\n  content: "\\e969";\n}\n\n.icon-reply:before {\n  content: "\\e96a";\n}\n\n.icon-bubble:before {\n  content: "\\e96b";\n}\n\n.icon-bubbles:before {\n  content: "\\e96c";\n}\n\n.icon-bubbles2:before {\n  content: "\\e96d";\n}\n\n.icon-bubble2:before {\n  content: "\\e96e";\n}\n\n.icon-bubbles3:before {\n  content: "\\e96f";\n}\n\n.icon-bubbles4:before {\n  content: "\\e970";\n}\n\n.icon-user:before {\n  content: "\\e971";\n}\n\n.icon-users:before {\n  content: "\\e972";\n}\n\n.icon-user-plus:before {\n  content: "\\e973";\n}\n\n.icon-user-minus:before {\n  content: "\\e974";\n}\n\n.icon-user-check:before {\n  content: "\\e975";\n}\n\n.icon-user-tie:before {\n  content: "\\e976";\n}\n\n.icon-quotes-left:before {\n  content: "\\e977";\n}\n\n.icon-quotes-right:before {\n  content: "\\e978";\n}\n\n.icon-hour-glass:before {\n  content: "\\e979";\n}\n\n.icon-spinner:before {\n  content: "\\e97a";\n}\n\n.icon-spinner2:before {\n  content: "\\e97b";\n}\n\n.icon-spinner3:before {\n  content: "\\e97c";\n}\n\n.icon-spinner6:before {\n  content: "\\e97f";\n}\n\n.icon-spinner7:before {\n  content: "\\e980";\n}\n\n.icon-spinner8:before {\n  content: "\\e981";\n}\n\n.icon-spinner11:before {\n  content: "\\e984";\n}\n\n.icon-binoculars:before {\n  content: "\\e985";\n}\n\n.icon-search:before {\n  content: "\\e986";\n}\n\n.icon-zoom-in:before {\n  content: "\\e987";\n}\n\n.icon-zoom-out:before {\n  content: "\\e988";\n}\n\n.icon-enlarge:before {\n  content: "\\e989";\n}\n\n.icon-shrink:before {\n  content: "\\e98a";\n}\n\n.icon-enlarge2:before {\n  content: "\\e98b";\n}\n\n.icon-shrink2:before {\n  content: "\\e98c";\n}\n\n.icon-key:before {\n  content: "\\e98d";\n}\n\n.icon-key2:before {\n  content: "\\e98e";\n}\n\n.icon-lock:before {\n  content: "\\e98f";\n}\n\n.icon-unlocked:before {\n  content: "\\e990";\n}\n\n.icon-wrench:before {\n  content: "\\e991";\n}\n\n.icon-equalizer:before {\n  content: "\\e992";\n}\n\n.icon-equalizer2:before {\n  content: "\\e993";\n}\n\n.icon-cog:before {\n  content: "\\e994";\n}\n\n.icon-cogs:before {\n  content: "\\e995";\n}\n\n.icon-hammer:before {\n  content: "\\e996";\n}\n\n.icon-magic-wand:before {\n  content: "\\e997";\n}\n\n.icon-aid-kit:before {\n  content: "\\e998";\n}\n\n.icon-stats-dots:before {\n  content: "\\e99b";\n}\n\n.icon-stats-bars:before {\n  content: "\\e99c";\n}\n\n.icon-stats-bars2:before {\n  content: "\\e99d";\n}\n\n.icon-trophy:before {\n  content: "\\e99e";\n}\n\n.icon-gift:before {\n  content: "\\e99f";\n}\n\n.icon-glass:before {\n  content: "\\e9a0";\n}\n\n.icon-glass2:before {\n  content: "\\e9a1";\n}\n\n.icon-mug:before {\n  content: "\\e9a2";\n}\n\n.icon-spoon-knife:before {\n  content: "\\e9a3";\n}\n\n.icon-meter:before {\n  content: "\\e9a6";\n}\n\n.icon-meter2:before {\n  content: "\\e9a7";\n}\n\n.icon-hammer2:before {\n  content: "\\e9a8";\n}\n\n.icon-bin:before {\n  content: "\\e9ac";\n}\n\n.icon-bin2:before {\n  content: "\\e9ad";\n}\n\n.icon-briefcase:before {\n  content: "\\e9ae";\n}\n\n.icon-road:before {\n  content: "\\e9b1";\n}\n\n.icon-power:before {\n  content: "\\e9b5";\n}\n\n.icon-switch:before {\n  content: "\\e9b6";\n}\n\n.icon-power-cord:before {\n  content: "\\e9b7";\n}\n\n.icon-clipboard:before {\n  content: "\\e9b8";\n}\n\n.icon-list-numbered:before {\n  content: "\\e9b9";\n}\n\n.icon-list:before {\n  content: "\\e9ba";\n}\n\n.icon-list2:before {\n  content: "\\e9bb";\n}\n\n.icon-tree:before {\n  content: "\\e9bc";\n}\n\n.icon-menu:before {\n  content: "\\e9bd";\n}\n\n.icon-menu2:before {\n  content: "\\e9be";\n}\n\n.icon-menu3:before {\n  content: "\\e9bf";\n}\n\n.icon-cloud:before {\n  content: "\\e9c1";\n}\n\n.icon-cloud-download:before {\n  content: "\\e9c2";\n}\n\n.icon-cloud-upload:before {\n  content: "\\e9c3";\n}\n\n.icon-cloud-check:before {\n  content: "\\e9c4";\n}\n\n.icon-download2:before {\n  content: "\\e9c5";\n}\n\n.icon-upload2:before {\n  content: "\\e9c6";\n}\n\n.icon-download3:before {\n  content: "\\e9c7";\n}\n\n.icon-upload3:before {\n  content: "\\e9c8";\n}\n\n.icon-sphere:before {\n  content: "\\e9c9";\n}\n\n.icon-earth:before {\n  content: "\\e9ca";\n}\n\n.icon-link:before {\n  content: "\\e9cb";\n}\n\n.icon-attachment:before {\n  content: "\\e9cd";\n}\n\n.icon-eye:before {\n  content: "\\e9ce";\n}\n\n.icon-eye-plus:before {\n  content: "\\e9cf";\n}\n\n.icon-star-empty:before {\n  content: "\\e9d7";\n}\n\n.icon-star-half:before {\n  content: "\\e9d8";\n}\n\n.icon-star-full:before {\n  content: "\\e9d9";\n}\n\n.icon-heart:before {\n  content: "\\e9da";\n}\n\n.icon-plus:before {\n  content: "\\ea0a";\n}\n\n.icon-minus:before {\n  content: "\\ea0b";\n}\n\n.icon-cross:before {\n  content: "\\ea0f";\n}\n\n.icon-checkmark:before {\n  content: "\\ea10";\n}\n\n.icon-checkmark2:before {\n  content: "\\ea11";\n}\n\n.icon-spell-check:before {\n  content: "\\ea12";\n}\n\n.icon-enter:before {\n  content: "\\ea13";\n}\n\n.icon-exit:before {\n  content: "\\ea14";\n}\n\n.icon-play2:before {\n  content: "\\ea15";\n}\n\n.icon-pause:before {\n  content: "\\ea16";\n}\n\n.icon-stop:before {\n  content: "\\ea17";\n}\n\n.icon-next:before {\n  content: "\\ea19";\n}\n\n.icon-backward:before {\n  content: "\\ea1a";\n}\n\n.icon-forward2:before {\n  content: "\\ea1b";\n}\n\n.icon-play3:before {\n  content: "\\ea1c";\n}\n\n.icon-pause2:before {\n  content: "\\ea1d";\n}\n\n.icon-stop2:before {\n  content: "\\ea1e";\n}\n\n.icon-backward2:before {\n  content: "\\ea1f";\n}\n\n.icon-forward3:before {\n  content: "\\ea20";\n}\n\n.icon-first:before {\n  content: "\\ea21";\n}\n\n.icon-last:before {\n  content: "\\ea22";\n}\n\n.icon-previous2:before {\n  content: "\\ea23";\n}\n\n.icon-next2:before {\n  content: "\\ea24";\n}\n\n.icon-eject:before {\n  content: "\\ea25";\n}\n\n.icon-volume-high:before {\n  content: "\\ea26";\n}\n\n.icon-volume-medium:before {\n  content: "\\ea27";\n}\n\n.icon-volume-low:before {\n  content: "\\ea28";\n}\n\n.icon-volume-mute:before {\n  content: "\\ea29";\n}\n\n.icon-volume-mute2:before {\n  content: "\\ea2a";\n}\n\n.icon-volume-increase:before {\n  content: "\\ea2b";\n}\n\n.icon-volume-decrease:before {\n  content: "\\ea2c";\n}\n\n.icon-loop:before {\n  content: "\\ea2d";\n}\n\n.icon-loop2:before {\n  content: "\\ea2e";\n}\n\n.icon-infinite:before {\n  content: "\\ea2f";\n}\n\n.icon-arrow-up-left:before {\n  content: "\\ea31";\n}\n\n.icon-arrow-up:before {\n  content: "\\ea32";\n}\n\n.icon-arrow-up-right:before {\n  content: "\\ea33";\n}\n\n.icon-arrow-right:before {\n  content: "\\ea34";\n}\n\n.icon-arrow-down-right:before {\n  content: "\\ea35";\n}\n\n.icon-arrow-down:before {\n  content: "\\ea36";\n}\n\n.icon-arrow-down-left:before {\n  content: "\\ea37";\n}\n\n.icon-arrow-left:before {\n  content: "\\ea38";\n}\n\n.icon-arrow-up-left2:before {\n  content: "\\ea39";\n}\n\n.icon-arrow-up2:before {\n  content: "\\ea3a";\n}\n\n.icon-arrow-up-right2:before {\n  content: "\\ea3b";\n}\n\n.icon-arrow-right2:before {\n  content: "\\ea3c";\n}\n\n.icon-arrow-down-right2:before {\n  content: "\\ea3d";\n}\n\n.icon-arrow-down2:before {\n  content: "\\ea3e";\n}\n\n.icon-arrow-down-left2:before {\n  content: "\\ea3f";\n}\n\n.icon-arrow-left2:before {\n  content: "\\ea40";\n}\n\n.icon-circle-up:before {\n  content: "\\ea41";\n}\n\n.icon-circle-right:before {\n  content: "\\ea42";\n}\n\n.icon-circle-down:before {\n  content: "\\ea43";\n}\n\n.icon-circle-left:before {\n  content: "\\ea44";\n}\n\n.icon-tab:before {\n  content: "\\ea45";\n}\n\n.icon-move-up:before {\n  content: "\\ea46";\n}\n\n.icon-move-down:before {\n  content: "\\ea47";\n}\n\n.icon-sort-alpha-asc:before {\n  content: "\\ea48";\n}\n\n.icon-sort-alpha-desc:before {\n  content: "\\ea49";\n}\n\n.icon-sort-numeric-asc:before {\n  content: "\\ea4a";\n}\n\n.icon-sort-numberic-desc:before {\n  content: "\\ea4b";\n}\n\n.icon-sort-amount-asc:before {\n  content: "\\ea4c";\n}\n\n.icon-sort-amount-desc:before {\n  content: "\\ea4d";\n}\n\n.icon-shift:before {\n  content: "\\ea4f";\n}\n\n.icon-checkbox-checked:before {\n  content: "\\ea52";\n}\n\n.icon-scissors:before {\n  content: "\\ea5a";\n}\n\n.icon-filter:before {\n  content: "\\ea5b";\n}\n\n.icon-bold:before {\n  content: "\\ea62";\n}\n\n.icon-underline:before {\n  content: "\\ea63";\n}\n\n.icon-italic:before {\n  content: "\\ea64";\n}\n\n.icon-superscript:before {\n  content: "\\ea69";\n}\n\n.icon-subscript:before {\n  content: "\\ea6a";\n}\n\n.icon-table:before {\n  content: "\\ea70";\n}\n\n.icon-table2:before {\n  content: "\\ea71";\n}\n\n.icon-paragraph-left:before {\n  content: "\\ea77";\n}\n\n.icon-paragraph-center:before {\n  content: "\\ea78";\n}\n\n.icon-paragraph-right:before {\n  content: "\\ea79";\n}\n\n.icon-paragraph-justify:before {\n  content: "\\ea7a";\n}\n\n.icon-share:before {\n  content: "\\ea7d";\n}\n\n.icon-new-tab:before {\n  content: "\\ea7e";\n}\n\n.icon-embed:before {\n  content: "\\ea7f";\n}\n\n.icon-embed2:before {\n  content: "\\ea80";\n}\n\n.icon-terminal:before {\n  content: "\\ea81";\n}\n\n.icon-share2:before {\n  content: "\\ea82";\n}\n\n.icon-mail2:before {\n  content: "\\ea84";\n}\n\n.icon-google-drive:before {\n  content: "\\ea8f";\n}\n\n.icon-facebook:before {\n  content: "\\ea90";\n}\n\n.icon-facebook2:before {\n  content: "\\ea91";\n}\n\n.icon-whatsapp:before {\n  content: "\\ea93";\n}\n\n.icon-rss:before {\n  content: "\\ea9b";\n}\n\n.icon-dropbox:before {\n  content: "\\eaae";\n}\n\n.icon-onedrive:before {\n  content: "\\eaaf";\n}\n\n.icon-github:before {\n  content: "\\eab0";\n}\n\n.icon-appleinc:before {\n  content: "\\eabe";\n}\n\n.icon-finder:before {\n  content: "\\eabf";\n}\n\n.icon-android:before {\n  content: "\\eac0";\n}\n\n.icon-windows:before {\n  content: "\\eac1";\n}\n\n.icon-windows8:before {\n  content: "\\eac2";\n}\n\n.icon-stackoverflow:before {\n  content: "\\ead0";\n}\n\n.icon-chrome:before {\n  content: "\\ead9";\n}\n\n.icon-file-word:before {\n  content: "\\eae1";\n}\n\n.icon-file-excel:before {\n  content: "\\eae2";\n}\n\n.icon-libreoffice:before {\n  content: "\\eae3";\n}\n\n.icon-codepen:before {\n  content: "\\eae8";\n}\n\n@font-face {\n    font-family: \'ps-regular\';\n    font-style: normal;\n    font-weight: 400;\n    src: local(\'Product Sans\'), url(\'PS-Regular.0a489488ab3cb2eb11f9.woff\') format(\'woff\');\n}\n\n:root {\n    /* main-stlyes */\n    --main-background-color: none;\n    --main-header-font-color: none;\n    /* message-styles */\n    --message-continer-border: none;\n    --message-padding: none;\n    --esther-message-color: none;\n    --esther-message-border: none;\n    --david-message-color: none;\n    --david-message-border: none;\n    --message-size: none;\n    --message-weight: none;\n}\n\nbody {\n    width: 100%;\n    height: 100%;\n    margin: 0px;\n    font-family: \'Space Mono\';\n    background: var(--main-background-image), var(--main-background);\n    background-size: cover;\n}\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n    color: var(--main-header-font-color);\n}\n\n.dark {\n     --main-background: rgba(0, 0, 0, 1); \n    --main-background-image: url(\'ringOnBlack.1fb718d920a4bb1f94d4.jpg\');\n    --main-header-font-color: rgb(248, 248, 248);\n    --message-continer-border: 2px solid rgb(255, 0, 0);\n    --message-padding: 5px 10px 5px 10px;\n    --esther-message-color: deeppink;\n    --esther-message-border: 2px solid purple;\n    --david-message-color: rgb(0, 119, 255);\n    --david-message-border: 2px solid blue;\n    --message-size: 14px;\n    --message-weight: 200;\n}\n\n.light {\n    --main-background: rgba(248, 248, 248, 1);\n    --main-background: url(https://raw.githubusercontent.com/bealesd/chatAngular/master/src/assets/images/spaceRed.jpg);\n    --main-header-font-color: rgb(0, 0, 0);\n    --message-continer-border: 2px solid rgb(252, 113, 113);\n    --message-padding: 5px 10px 5px 10px;\n    --esther-message-color: rgb(252, 97, 180);\n    --esther-message-border: 2px solid rgb(238, 137, 238);\n    --david-message-color: rgb(97, 97, 248);\n    --david-message-border: 2px solid rgb(126, 126, 240);\n    --message-size: 14px;\n    --message-weight: 600;\n}\n\n.todo {\n    --main-background: linear-gradient(120deg, #1d4e89, #00b2ca);\n    --main-background-image: none;\n}\n\n.active-link{\n    color:blue!important;\n}',""]),e.default=r},d5MC:function(n,e,o){var t=o("LboF"),r=o("HCrD");"string"==typeof(r=r.__esModule?r.default:r)&&(r=[[n.i,r,""]]),t(r,{insert:"head",singleton:!1}),n.exports=r.locals||{}}},[[2,0]]]);