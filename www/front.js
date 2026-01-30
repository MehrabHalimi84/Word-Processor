// ------------------------- Execute Calculation
function runCalc() {
    if (!validateModes()) return;

    const input = document.getElementById("textInput").value.trim();
    if (!input) {
        alert("متن خالی است!");
        return;
    }

    const isSpecial = activeMode === "special";
    const isCombined = activeMode === "combined";


    // 1. Basic calculation
    let result = calcWordValues(input);

    // 2. Apply Zero-Free logic if Special Mode is active
    if (isSpecial) {
        result = applyZeroFreeMode(result);
        // Apply cumulative calculation for Special Mode (if needed)
        applyZeroFreeAccumulation(result.result);
    }

    // 3. Calculate zeroFreeValue and zeroFreeAccumulated if Combined Mode is active
    if (isCombined) {
        let accumulator = 0;
        result.result.forEach(item => {
            // If Special Mode was active, item.value is already zero-freed
            const zeroFreeVal = isSpecial ? item.value : removeZeros(item.value);
            item.zeroFreeValue = zeroFreeVal;
            accumulator = removeZeros(accumulator + zeroFreeVal);
            item.zeroFreeAccumulated = accumulator;
        });
        result.finalZeroFreeTotal = accumulator;
    }

    // 4. Store data for Copy/Share functionality
    window.lastCalcData = result;

    // 5. Render table and summary
    renderWordList(result, isSpecial, isCombined);
    renderSummary(result, isSpecial, isCombined);
}


function removeZeros(num) {
    return Number(String(num).replace(/0/g, ''));
}

function applyZeroFreeMode(data) {

    const newResult = data.result.map(item => ({
        ...item,
        value: removeZeros(item.value)
    }));

    return {
        ...data,
        result: newResult,
        totalValue: newResult.reduce((s, i) => s + i.value, 0)
    };
}

function applyZeroFreeAccumulation(list) {
    let acc = 0;

    list.forEach((item, index) => {
        if (index === 0) {
            item.zeroFreeAccumulated = '';
            acc = removeZeros(item.value);
        } else {
            acc = removeZeros(acc + item.value);
            item.zeroFreeAccumulated = acc;
        }
    });
    return acc;
}

// ------------------------- Full Page Reset
function resetAll() {
    document.getElementById("textInput").value = "";
    document.getElementById("errorBox").innerHTML = "";
    document.getElementById("output").innerHTML = "";

    const copyBtn = document.getElementById("copyBtn");
    const shareBtn = document.getElementById("shareBtn");
    if (copyBtn) copyBtn.style.display = "none";
    if (shareBtn) shareBtn.style.display = "none";
    const startInput = document.getElementById("startIndexInput");
    if (startInput) startInput.value = "";

    combinedStartIndex = 1;


    delete window.lastCalcData;

    // ⭐ Safe fallback to Normal Mode ⭐
    setMode("normal");
}


// ------------------------- Copy Results
// ------------------------- Copy Results with Indexing
function copyTableData() {
    const data = window.lastCalcData;
    const isCombined = activeMode === "combined";

    // 🔹 Combined Mode Logic
    if (isCombined) {
        if (!data || !data.result) {
            alert("ابتدا محاسبه کنید!");
            return;
        }

        let txt = "";
        const baseIndex = combinedStartIndex;

        data.result.forEach((item, index) => {
            const rowIndex = index + baseIndex;

            txt += `${rowIndex}🔹${item.word}💢${item.value}💢`;

            if (item.zeroFreeAccumulated !== undefined) {
                txt += `${item.zeroFreeAccumulated}💢`;
            }

            txt += `\n`;
        });

        txt += `\n`;
        txt += `👇👇👇\n`;
        txt += `✅ جمع  کل بدون صفر💎 ${data.finalZeroFreeTotal} 💎\n`;
        txt += `✅ جمع  کل با احتساب صفر💎 ${data.totalValue} 💎\n`;
        txt += `✅ تعداد کل کلمات: 💎 ${data.totalWords} 💎\n`;
        txt += `✅ تعداد کل حروف: 💎 ${data.totalLetters} 💎`;

        navigator.clipboard.writeText(txt.trim());
        alert("کپی شد!");
        return;
    }


    // 🔸 Validation: No data available
    if (!data) {
        alert("ابتدا محاسبه کنید!");
        return;
    }

    const isSpecial = activeMode === "special";

    // ⭐⭐⭐ Special Mode: Step-by-Step Output ⭐⭐⭐
    if (isSpecial) {
        let out = "";
        let running = 0;

        data.result.forEach((item, index) => {
            const v = item.value;
            if (index === 0) {
                running = v;
                out += `${index + 1}🔹  ${v} 🟢 ${running}\n`;
            } else {
                const before = running;
                running = removeZeros(before + v);
                out += `${index + 1}🔹  ${before} ➕ ${v} 🟢 ${running}\n`;
            }
        });

        out += "----------------------------------------------\n";
        out += `جمع کل بدون صفر:  ${running}\n`;
        out += `تعداد کل کلمات:  ${data.totalWords}\n`;
        out += `تعداد کل حروف:  ${data.totalLetters}\n`;

        navigator.clipboard.writeText(out);
        alert("کپی شد!");
        return;
    }

    // ⭐⭐⭐ Normal Mode: Classic Output ⭐⭐⭐
    let text = "";

    data.result.forEach((item, index) => {
        text += `${index + 1} ♦️ ${item.word} ♦️ ${item.value} ♦️ (${item.letters})\n`;
    });

    text += "----------------------------------------------\n";
    text += `جمع کل ارزش عددی: ${data.totalValue}\n`;
    text += `تعداد کل کلمات:  ${data.totalWords}\n`;
    text += `تعداد کل حروف:  ${data.totalLetters}\n`;

    navigator.clipboard.writeText(text);
    alert("کپی شد!");
}



// ------------------------- Copy Fallback for Older Browsers
function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand("copy");
        alert("متن کپی شد!");
    } catch (err) {
        alert("خطا در کپی!");
    }

    document.body.removeChild(textarea);
}



// ------------------------- Share Functionality (Web Share API)
function shareTableData() {
    const data = window.lastCalcData;
    if (!data) {
        alert("ابتدا محاسبه کنید!");
        return;
    }

    let shareText = "";

    // Main Output Generation
    data.result.forEach((item, index) => {
        shareText += `${index + 1} ♦️ ${item.word} ♦️ ${item.value} ♦️ (${item.letters})\n`;
    });
    shareText += "----------------------------------------------\n";
    shareText += `جمع کل ارزش عددی:\t${data.totalValue}\n`;
    shareText += `تعداد کل کلمات:\t${data.totalWords}\n`;
    shareText += `تعداد کل حروف:\t${data.totalLetters}\n\n`;
    shareText += "حساب عددی کلمات فارسی";

    if (navigator.share) {
        navigator.share({
            title: "حساب عددی کلمات",
            text: shareText,
            url: window.location.href
        }).then(() => {
            showShareSuccess();
        }).catch(() => {
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}


// ------------------------- Share Fallback
function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 متن کپی شد! می‌توانید هرجا Paste کنید.");
        showShareSuccess();
    }).catch(() => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("📋 متن کپی شد! می‌توانید هرجا Paste کنید.");
        showShareSuccess();
    });
}



// ------------------------- Share Button Animation
function showShareSuccess() {
    const btn = document.getElementById("shareBtn");
    const original = btn.innerHTML;

    btn.innerHTML = "✅ اشتراک شد!";
    btn.style.backgroundColor = "#4caf50";

    setTimeout(() => {
        btn.innerHTML = original;
        btn.style.backgroundColor = "";
    }, 1200);
}



// ================= MODE CONTROLLER (FINAL, BULLETPROOF) =================

let activeMode = "normal";

function setupModeToggles() {
    const normal = document.getElementById("checkNormal");
    const special = document.getElementById("checkSpecial");
    const combined = document.getElementById("checkCombined");

    if (!normal || !special || !combined) {
        console.error("Mode checkboxes not found");
        return;
    }

    setMode("normal");

    [normal, special, combined].forEach(cb => {

        cb.addEventListener("mousedown", e => {
            e.preventDefault();      // ✅ PRE-toggle
        });

        cb.addEventListener("click", () => {
            if (
                (cb === normal && activeMode !== "normal") ||
                (cb === special && activeMode !== "special") ||
                (cb === combined && activeMode !== "combined")
            ) {
                setMode(
                    cb === normal
                        ? "normal"
                        : cb === special
                            ? "special"
                            : "combined"
                );
            }
        });
    });
}

function setMode(mode) {
    const normal = document.getElementById("checkNormal");
    const special = document.getElementById("checkSpecial");
    const combined = document.getElementById("checkCombined");

    normal.checked = mode === "normal";
    special.checked = mode === "special";
    combined.checked = mode === "combined";

    activeMode = mode;

    const combinedBox = document.getElementById("combinedOptions");
    if (combinedBox) {
        combinedBox.style.display = mode === "combined" ? "block" : "none";
    }
}

function validateModes() {
    return true;
}

let combinedStartIndex = 1;


window.addEventListener("DOMContentLoaded", () => {
    setupModeToggles();

    const startInput = document.getElementById("startIndexInput");

    if (startInput) {
        startInput.addEventListener("input", () => {
            const val = parseInt(startInput.value, 10);

            combinedStartIndex = Number.isInteger(val) && val >= 0 ? val : 1;
        });
    }
});
