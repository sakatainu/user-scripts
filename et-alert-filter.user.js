// ==UserScript==
// @name         E-timecard alert抑止
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       You
// @match        https://e-timecard.ne.jp/s/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const blackList = [
    '.*休憩時間の入力に間違いはありませんか.*',
    '.*入力された情報（勤怠・備考・立替金・打刻情報）がクリアされます。.*',
    '.*入力情報をクリアしました。.*',
    '.*日々承認の申請.*',
    '.*休憩時間が0分、もしくは未入力となっています.*',
  ];

  window.alert = (() => {
    const org = window.alert;

    return (message) => {
      const shouldSkip = blackList.some((v) => new RegExp(v).test(message));
      if (shouldSkip) return true;
      return org(message);
    };
  })();

  window.confirm = (() => {
    const org = window.confirm;

    return (message) => {
      const shouldSkip = blackList.some((v) => new RegExp(v).test(message));
      if (shouldSkip) return true;
      return org(message);
    };
  })();
})();
