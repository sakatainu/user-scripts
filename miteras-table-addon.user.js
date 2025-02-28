// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-11-29
// @description  try to take over the world!
// @author       You
// @match        https://kintai.miteras.jp/PXT_PTCS/work-condition
// @icon         https://www.google.com/s2/favicons?sz=64&domain=miteras.jp
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function toHoursAndMinutes(totalMinutes) {
    if (Number.isNaN(totalMinutes)) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, 0)}:${minutes.toString().padStart(2, 0)}`;
  }

  setInterval(() => {
    if (document.getElementById('total-worktime-hour')) return;

    const totalWorktimeElm = document.getElementById('total-worktime');
    const totalWorktimeMinutes = parseInt(totalWorktimeElm?.innerText, 10);

    const hoursLabel = toHoursAndMinutes(totalWorktimeMinutes);
    if (!hoursLabel) return;
    totalWorktimeElm.insertAdjacentHTML(
      'afterend',
      `
          <span id="total-worktime-hour" style="margin-left:4px">(${hoursLabel})</span>
      `
    );
  }, 100);
})();
