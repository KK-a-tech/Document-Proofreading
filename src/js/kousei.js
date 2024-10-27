// 変数 ClientId に API の Client IDを代入
const appid = 'dj00aiZpPVZGcTQwclFraE9kWSZzPWNvbnN1bWVyc2VjcmV0Jng9OWQ-';

//必要要件の送信フォーマットを設定し送信、JSON オブジェクトで値を返す
async function setting_service(text) {
    const url = 'https://jlp.yahooapis.jp/KouseiService/V2/kousei?appid=' + encodeURIComponent(appid);
    return await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            "id": "1111",
            "jsonrpc" : "2.0",
            "method" : "jlp.kouseiservice.kousei",
            "params" : { "q" : text }
        }),
        mode: 'cors'
    }).then(res => res.json()).catch(console.error);
}

// setting_service関数を使用し、校正支援 API データをに送信
async function proofreading_execution() {
    const text = document.querySelector("#input-text").value;
    const obj = await setting_service(text);
    if (!obj) return;
    make_view(text, obj);
    convert_view_to_text();
}

//校正案の出力・色付け用の設定
function make_view(text, obj) {
    [...obj.result.suggestions].reverse().forEach(s => {
        const pre = text.substring(0, parseInt(s.offset));
        const post = text.substring(parseInt(s.offset) + parseInt(s.length));
        const note = s.rule + (s.note ? ' : ' + s.note : '');
        const sug = s.suggestion ? s.suggestion : s.word;
        text = `${pre}<span title="${note}"><del>${s.word}</del><ins>${sug}</ins>` +
            `<input type="checkbox"></span>${post}`;
    });
    document.querySelector("#view").innerHTML = text.replaceAll('\n', '<br>\n');
    Array.from(document.querySelectorAll("#view span")).forEach(e => {
        e.querySelector('del').addEventListener('click', () => set_checkbox(e, false));
        e.querySelector('ins').addEventListener('click', () => set_checkbox(e, true));
        e.querySelector('ins').addEventListener('input', () => convert_view_to_text());
        e.querySelector('ins').contentEditable = true;
        e.querySelector('input').addEventListener('change', () => change_suggestion_style(e));
    });
}

//校正案のチェックボックスによる文字色の色付け
function change_suggestion_style(e) {
    e.querySelector('del').style.color = e.querySelector('input').checked ? "gray" : "black";
    e.querySelector('ins').style.color = e.querySelector('input').checked ? "black" : "gray";
    convert_view_to_text();
}

//編集結果を最終稿テキストに変換し出力テキストエリアに表示
function convert_view_to_text() {
    const tree = document.querySelector("#view").cloneNode(true);
    Array.from(tree.querySelectorAll('span')).forEach(e =>
        e.querySelector(e.querySelector('input').checked ? 'del' : 'ins').remove());
    document.querySelector("#output-text").value = tree.textContent;
}

//一括承認・承認リセットボタン用
const set_checkboxes = (checked) =>
      Array.from(document.querySelectorAll('#view span')).forEach(e => set_checkbox(e, checked));
const set_checkbox = (e, checked) =>
      (e.querySelector('input').checked != checked) && e.querySelector('input').click();