const persianAlphabet = [
    "ا", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ",
    "د", "ذ", "ر", "ز", "ژ", "س", "ش", "ص", "ض",
    "ط", "ظ", "ع", "غ", "ف", "ق", "ک", "گ", "ل",
    "م", "ن", "و", "ه", "ی"
];

const alefba = {};
persianAlphabet.forEach((ch, i) => alefba[ch] = i + 2);



// ----------------------------
function normalizePersian(ch) {

    // Remove all diacritics and combining marks
    if (/[\u064B-\u065F\u0670\u06D6-\u06ED\u08F0-\u08FF]/.test(ch)) return "";

    // Remove ZERO-WIDTH characters and RTL/LTR control marks
    if (/[\u2000-\u200F\u202A-\u202F\u2060-\u206F]/.test(ch)) return "";

    // Remove symbols, emojis, and Unicode-class punctuation
    if (/[\p{Symbol}\p{Punctuation}\p{Emoji}]/u.test(ch)) return "";

    if (/[^\u0600-\u06FF\s]/.test(ch)) return "";
    if (/[0-9\u06F0-\u06F9\u0660-\u0669]/.test(ch)) return "";

    // Map Arabic characters to Persian equivalents
    const map = {
        "أ": "ا",
        "إ": "ا",
        "آ": "ا",
        "ٱ": "ا",
        "ؤ": "و",
        "ئ": "ی",
        "ء": "ی",
        "ي": "ی",
        "ى": "ی",
        "ة": "ه",
        "ۀ": "ه",
        "ك": "ک",
        "ٮ": "ب",
        "ݐ": "ت",
        "ݑ": "ت",
        "ﭘ": "پ",
        "ﭼ": "چ",
        "ﮊ": "ژ",
        "ﮋ": "ژ",
        "ڎ": "ذ",
        "ږ": "ژ",
        "ڛ": "س",
        "ڜ": "س",
        "ڟ": "ط",
        "ۿ": "ه"
    };

    return map[ch] || ch;
}


function cleanFullText(text) {
    let out = "";

    for (let i = 0; i < text.length; i++) {
        out += normalizePersian(text[i]);
    }

    // Convert all whitespace (including Enter, Tab) to a single space
    out = out.replace(/\s+/g, " ");

    return out.trim();
}

// ----------------------------
function mergeStandaloneVZ(text) {
    const parts = text.split(" ").filter(p => p.trim() !== "");

    let out = [];
    for (let i = 0; i < parts.length; i++) {

        // If the word is "و" (Va) or "ز" (Za) and is followed by another word
        if ((parts[i] === "و" || parts[i] === "ز") && parts[i + 1]) {
            out.push(parts[i] + parts[i + 1]);
            i++;
        } else {
            out.push(parts[i]);
        }
    }

    return out.join(" ");
}


// ----------------------------
function calcWordValues(input) {

    input = cleanFullText(input);

    // *** Robust handling of ENTER and TAB characters ***
    input = input.replace(/\s+/g, " ").trim();

    // Merge standalone "Va" to the next word
    input = mergeStandaloneVZ(input);

    const wordList = input.split(" ").filter(w => w.trim() !== "");
    const result = [];

    let totalValue = 0;
    let totalLetters = 0;

    for (let word of wordList) {

        const normalizedArr = [...word]
            .map(ch => normalizePersian(ch))
            .filter(ch => ch !== "");

        let sum = 0;

        // Correct loop for character processing
        for (let ch of normalizedArr) {

            // If character is not in the 32-letter alphabet → skip
            if (!(ch in alefba)) {
                continue;
            }

            sum += alefba[ch];
        }

        totalValue += sum;
        totalLetters += normalizedArr.length;

        result.push({
            word: normalizedArr.join(""),
            value: sum,
            letters: normalizedArr.length
        });
    }

    return {
        result,
        totalWords: wordList.length,
        totalLetters,
        totalValue
    };
}


// ----------------------------
function renderWordList(data, isSpecial, isCombined) {
    const output = document.getElementById("output");
    // Show Copy and Share buttons
    const copyBtn = document.getElementById("copyBtn");
    const shareBtn = document.getElementById("shareBtn");
    if (copyBtn) copyBtn.style.display = "block";
    if (shareBtn) shareBtn.style.display = "block";

    if (isCombined) {
        let table = `<table class="result-table">
        <thead>
            <tr>
                <th>ردیف</th>
                <th>کلمه</th>
                <th>ارزش عددی</th>
                <th>ارزش عددی بدون صفر</th>
            </tr>
        </thead>
        <tbody>`;

        const baseIndex = combinedStartIndex;

        data.result.forEach((item, index) => {
            table += `<tr>
        <td>${index + baseIndex}</td>
        <td>${item.word}</td>
        <td>${item.value}</td>
        <td>${item.zeroFreeAccumulated}</td>
    </tr>`;
        });

        table += `</tbody></table>`;
        output.innerHTML = table;
        return;
    }

    // Word list table (Standard or Special mode)
    let table = `
        <table class="result-table">
       <thead>
    <tr>
        <th>ردیف</th>
        <th>کلمه</th>
        <th>ارزش عددی</th>
        <th>تعداد حروف</th>
        ${isSpecial ? '<th>ارزش عددی بدون صفر</th>' : ''}
    </tr>
</thead>
            <tbody>
    `;

    data.result.forEach((item, index) => {
        table += `
          <tr>
    <td>${index + 1}</td>
    <td>${item.word}</td>
    <td>${item.value}</td>
    <td>${item.letters}</td>
    ${isSpecial ? `<td>${item.zeroFreeAccumulated ?? ''}</td>` : ''}
</tr>`;
    });

    table += `
            </tbody>
        </table>
        <br>
    `;

    output.innerHTML = table;
}

function renderSummary(result, isSpecial, isCombined) {
    const output = document.getElementById("output");
    let html = '';

    if (isCombined) {
        html = `
        <table class="summary-table">
            <tr><td>جمع کل ارزش عددی</td><td>${result.totalValue}</td></tr>
            <tr><td>جمع کل ارزش عددی بدون صفر</td><td>${result.finalZeroFreeTotal}</td></tr>
            <tr><td>تعداد کل کلمات</td><td>${result.totalWords}</td></tr>
            <tr><td>تعداد کل حروف</td><td>${result.totalLetters}</td></tr>
        </table>`;
    } else {
        const title = isSpecial
            ? 'جمع کل ارزش عددی بدون احتساب صفر'
            : 'جمع کل ارزش عددی';
        const totalValue = isSpecial
            ? result.result.reduce((sum, item) => sum + item.value, 0)
            : result.totalValue;

        html = `
        <table class="summary-table">
            <tbody>
                <tr>
                    <td><b>${title}</b></td>
                    <td>${totalValue}</td>
                </tr>
                <tr>
                    <td><b>تعداد کل کلمات</b></td>
                    <td>${result.totalWords}</td>
                </tr>
                <tr>
                    <td><b>تعداد کل حروف</b></td>
                    <td>${result.totalLetters}</td>
                </tr>
            </tbody>
        </table>
        `;
    }

    output.insertAdjacentHTML("beforeend", html);
}
