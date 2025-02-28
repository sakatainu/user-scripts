// ==UserScript==
// @name         勤怠データをCSV出力
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  勤怠・工数のデータをCSVとして出力する
// @author       You
// @match        https://kintai.miteras.jp/PXT_PTCS/work-condition*
// @grant        none
// @updateURL    https://github.com/sakatainu/user-scripts/raw/refs/heads/main/miteras-table-export.user.js
// @downloadURL  https://github.com/sakatainu/user-scripts/raw/refs/heads/main/miteras-table-export.user.js
// ==/UserScript==

(function () {
  'use strict';

  // CSVのダウンロード関数
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 日付を yyyy-mm-dd 形式に変換する関数
  function formatDate(dateString) {
    const match = dateString.match(/(\d{2})\((.)\)/); // 例: "03(月)" → "03"
    if (!match) return '';
    const day = match[1];
    const dateElement = document.querySelector('#summary-view-current-date');
    const yearMonth = dateElement?.getAttribute('data-date') || '1970/01'; // 年月を取得
    const [_, month, year] = yearMonth.split('/'); // 日、月、年に分割
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // 勤務時間を空白にする処理
  function formatTime(time) {
    return time === '--:--' || time === '00:00' ? '' : time;
  }

  // テーブルデータをCSV形式に変換
  function tableToCSV() {
    let rows = document.querySelectorAll('#attendance-table-body table tr'); // 勤怠テーブルの行を取得
    let csvContent = [];

    // 指定のヘッダー
    let headers = ['日付', '出勤', '勤務開始時間', '勤務終了時間', '休憩時間', '勤務合計'];
    csvContent.push(headers.join(','));

    // 各行のデータを取得
    rows.forEach((row) => {
      let cols = row.querySelectorAll('td');

      if (cols.length > 0) {
        let rowData = [];
        rowData.push(formatDate(cols[1]?.innerText.trim() || '')); // 日付
        rowData.push(formatTime(cols[7]?.innerText.trim() || '')); // 出勤
        rowData.push(formatTime(cols[9]?.innerText.trim() || '')); // 勤務開始時間
        rowData.push(formatTime(cols[10]?.innerText.trim() || '')); // 勤務終了時間
        rowData.push(formatTime(cols[12]?.innerText.trim() || '')); // 休憩時間
        rowData.push(formatTime(cols[16]?.innerText.trim() || '')); // 勤務合計

        csvContent.push(rowData.join(','));
      }
    });

    return csvContent.join('\n');
  }

  // CSVダウンロードボタンを追加
  function addDownloadButton() {
    let button = document.createElement('button');
    button.innerText = 'CSV出力';
    button.style.margin = '10px';
    button.style.padding = '5px 10px';
    button.style.fontSize = '14px';
    button.style.cursor = 'pointer';

    button.onclick = function () {
      let csvData = tableToCSV();
      if (csvData) {
        downloadCSV(csvData, 'kintai_data.csv');
      } else {
        alert('勤怠データが見つかりませんでした。');
      }
    };

    // ボタンをページのアクションボックスに追加
    let actionBox = document.querySelector('.actionBox__RightBox');
    if (actionBox) {
      actionBox.appendChild(button);
    }
  }

  // ページ読み込み後に実行
  window.addEventListener('load', addDownloadButton);
})();
