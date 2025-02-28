// ==UserScript==
// @name         勤怠データをCSV出力
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  勤怠・工数のデータをCSVとして出力する
// @author       You
// @match        https://kintai.miteras.jp/PXT_PTCS/work-condition*
// @grant        none
// @updateURL    https://github.com/sakatainu/user-scripts/raw/refs/heads/main/miteras-table-export.user.js
// @downloadURL  https://github.com/sakatainu/user-scripts/raw/refs/heads/main/miteras-table-export.user.js
// ==/UserScript==

(function() {
    'use strict';

    // CSVのダウンロード関数
    function downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // テーブルデータをCSV形式に変換
    function tableToCSV() {
        let rows = document.querySelectorAll("#attendance-table-body table tr"); // 勤怠テーブルの行を取得
        let csvContent = [];

        // ヘッダーを取得
        let headers = [
            "日付", "勤務種別", "シフト", "承認状況", "出社", "退社", 
            "勤務開始", "勤務終了", "休憩", "残業", "控除", "勤務合計", "出社状況"
        ];
        csvContent.push(headers.join(","));

        // 各行のデータを取得
        rows.forEach(row => {
            let cols = row.querySelectorAll("td");

            if (cols.length > 0) {
                let rowData = [];
                rowData.push(cols[1]?.innerText.trim() || "");  // 日付
                rowData.push(cols[2]?.innerText.trim() || "");  // 勤務種別
                rowData.push(cols[3]?.innerText.trim() || "");  // シフト
                rowData.push(cols[4]?.innerText.trim() || "");  // 承認状況
                rowData.push(cols[7]?.innerText.trim() || "");  // 出社時間
                rowData.push(cols[8]?.innerText.trim() || "");  // 退社時間
                rowData.push(cols[9]?.innerText.trim() || "");  // 勤務開始
                rowData.push(cols[10]?.innerText.trim() || ""); // 勤務終了
                rowData.push(cols[12]?.innerText.trim() || ""); // 休憩時間
                rowData.push(cols[13]?.innerText.trim() || ""); // 残業時間
                rowData.push(cols[15]?.innerText.trim() || ""); // 控除時間
                rowData.push(cols[16]?.innerText.trim() || ""); // 勤務合計
                rowData.push(cols[18]?.innerText.trim() || ""); // 出社状況

                csvContent.push(rowData.join(","));
            }
        });

        return csvContent.join("\n");
    }

    // CSVダウンロードボタンを追加
    function addDownloadButton() {
        let button = document.createElement("button");
        button.innerText = "CSV出力";
        button.style.margin = "10px";
        button.style.padding = "5px 10px";
        button.style.fontSize = "14px";
        button.style.cursor = "pointer";

        button.onclick = function() {
            let csvData = tableToCSV();
            if (csvData) {
                downloadCSV(csvData, "kintai_data.csv");
            } else {
                alert("勤怠データが見つかりませんでした。");
            }
        };

        // ボタンをページのアクションボックスに追加
        let actionBox = document.querySelector(".actionBox__RightBox");
        if (actionBox) {
            actionBox.appendChild(button);
        }
    }

    // ページ読み込み後に実行
    window.addEventListener("load", addDownloadButton);
})();
