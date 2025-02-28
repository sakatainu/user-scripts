// ==UserScript==
// @name         E-timecard 勤務時間表示
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  try to take over the world!
// @author       You
// @updateURL    https://github.com/sakatainu/user-scripts/raw/refs/heads/main/et-table-addon.user.js
// @downloadURL  https://github.com/sakatainu/user-scripts/raw/refs/heads/main/et-table-addon.user.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.9.8/dayjs.min.js
// @match        https://e-timecard.ne.jp/*
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  /*
   * ミリ秒 -> 分 = ミリ秒 / MS_MIN
   * 分 -> ミリ秒 = ミリ秒 * MS_MIN
   */
  const MS_MIN = 60 /* minutes */ * 1000; /* ms */
  const zeroPadding = new Intl.NumberFormat('ja', { minimumIntegerDigits: 2 });

  /**
   * 経過時間計算
   * @param {string} startTimeText hh:MM形式
   * @param {string} endTimeText hh:MM形式
   * @returns 経過時間
   */
  const calcElapsed = (startTimeText, endTimeText) => {
    const startDate = dayjs(`1970-01-01 ${startTimeText.trim()}:00`);
    const endDate = dayjs(`1970-01-01 ${endTimeText.trim()}:00`);

    if (!startDate.isValid() || !endDate.isValid()) {
      return null;
    }

    return endDate.valueOf() - startDate.valueOf();
  };

  /**
   * 時間計算
   * @param {number} elapsedMillisecond 経過時間（ミリ秒）
   * @returns 経過時間 {hour, minute}
   */
  const calcDate = (elapsedMillisecond) => {
    const workingMinutes = elapsedMillisecond / MS_MIN;
    const workingHours = Math.floor(workingMinutes / 60);
    const workingMinute = workingMinutes % 60;

    return {
      hour: workingHours,
      minute: workingMinute,
    };
  };

  const mngRows = {
    'start-Time': {
      label: '開始時刻',
      clazz: 'hdr-start-Time',
      index: 0,
    },
    'end-time': {
      label: '終了時刻',
      clazz: 'hdr-end-time',
      index: 0,
    },
    'break-time': {
      label: '休憩時間(分)',
      clazz: 'hdr-break-time',
      index: 0,
    },
    'night-break-time': {
      label: '深夜休憩(分)',
      clazz: 'hdr-night-break-time',
      index: 0,
    },
    'working-hours': {
      label: '拡_勤務合計',
      clazz: 'hdr-working-hours',
      index: 0,
    },
  };

  const startTimeLabel = '開始時刻';
  const endTimeLabel = '終了時刻';
  const WORK_TABLE_ID = 'work-times';

  // 勤怠テーブルに識別子がないので、勤怠テーブル検索しい識別子をつける
  // ヘッダーも同様
  const tables = Array.from(document.querySelectorAll('#mainarea table'));
  const targetTable = tables.find((tbl) => {
    const ths = Array.from(tbl.querySelectorAll('th'));

    return [startTimeLabel, endTimeLabel].every((txt) => {
      return ths.some((th) => th.textContent === txt);
    });
  });

  // 必要な識別子を付与
  targetTable.setAttribute('id', WORK_TABLE_ID);
  const titleThs = Array.from(targetTable.querySelectorAll('tr:first-of-type th'));
  Object.keys(mngRows).forEach((key) => {
    const mangRow = mngRows[key];
    const target = titleThs.find((th) => th.textContent === mangRow.label);
    if (!target) return;

    target.classList.add(mangRow.clazz);
    mangRow.index = target.cellIndex;
  });

  // ヘッダーに拡張列を追加
  const header = document.createElement('th');
  header.textContent = mngRows['working-hours'].label;
  header.classList.add('cmWidthP10');
  header.classList.add(mngRows['working-hours'].clazz);

  const nightBreakTimeTh = targetTable.querySelector(`.${mngRows['night-break-time'].clazz}`);
  nightBreakTimeTh.parentNode.insertBefore(header, nightBreakTimeTh.nextElementSibling);

  const extWorkingHoursTh = targetTable.querySelector(`.${mngRows['working-hours'].clazz}`);
  mngRows['working-hours'].index = extWorkingHoursTh.cellIndex;

  // 拡張列生成関数
  const createWorkingHoursRow = (startDateText, endDateText, breakTimeText) => {
    const elapsedMS = calcElapsed(startDateText, endDateText);
    const breakTimeH = Number(breakTimeText);

    if (!elapsedMS || isNaN(breakTimeH)) {
      return document.createElement('td');
    }

    const td = document.createElement('td');
    const workTimeMS = elapsedMS - breakTimeH * MS_MIN;
    const workingDate = calcDate(workTimeMS);
    const hourText = zeroPadding.format(workingDate.hour);
    const minuteText = zeroPadding.format(workingDate.minute);
    td.textContent = `${hourText}:${minuteText}`;
    return td;
  };

  // 拡張列を追加
  const rows = Array.from(targetTable.querySelectorAll('tr:not(:nth-of-type(1))'));
  rows.forEach((row) => {
    const startDateText = row.cells[mngRows['start-Time'].index].textContent.trim();
    const endDateText = row.cells[mngRows['end-time'].index].textContent.trim();
    const breakTimeText = row.cells[mngRows['break-time'].index].textContent.trim();

    const newRow = createWorkingHoursRow(startDateText, endDateText, breakTimeText);

    const target = row.cells[mngRows['night-break-time'].index];
    target.parentNode.insertBefore(newRow, target.nextElementSibling);
  });

  /*
   * [定時]ボタン拡張
   *  - [自宅]チェックボックスをチェック
   *  - [終了時刻]入力欄にカーソル
   */
  window.setRegTime = (() => {
    const org = window.setRegTime;
    return (n) => {
      const result = org(n);

      document.querySelector(`#workPlaceKbnHome${n}`).checked = true;
      const inputElem = document.querySelector(`#endTimeInput${n}`);
      inputElem?.focus();
      inputElem?.select();

      return result;
    };
  })();

  window.onload = () => {
    const element = document.documentElement;
    const bottom = element.scrollHeight - element.clientHeight;
    window.scroll(0, bottom);
  };
})();
