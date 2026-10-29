// ============================================================
// saved-phrases.js
// Saved Phrases page: सेभ गरेका वाक्य र तिनको अर्थ देखाउने, हटाउने।
// अर्थ phrases-data.js बाट आउँछ।
// ============================================================

// i18n तयार नहुँदासम्म अङ्ग्रेजी fallback दिने सुरक्षित lookup
function sphT(key, fallback) {
    try {
        if (window.LBT && typeof window.LBT.t === "function") {
            const value = window.LBT.t(key);
            if (typeof value === "string" && value !== "" && value !== key) {
                return value;
            }
        }
    } catch (error) {
        // तल fallback
    }
    return fallback;
}

const savedList = document.querySelector("#saved-phrase-list");
const emptyMessage = document.querySelector("#saved-empty");
const pageStatus = document.querySelector("#saved-page-status");
const phrasesKey = "lifego-saved-phrases";

let phrases = [];

// Browser मा सेभ भएको list पढ्ने
try {
    const stored = JSON.parse(localStorage.getItem(phrasesKey) || "[]");
    if (Array.isArray(stored)) {
        phrases = stored.filter(function (item) {
            return typeof item === "string";
        });
    }
} catch (error) {
    pageStatus.textContent = sphT("sph.readFail", "Could not read your saved phrases.");
}

// एउटा वाक्य हटाउने
function removePhrase(index) {
    const remaining = phrases.filter(function (item, itemIndex) {
        return itemIndex !== index;
    });

    try {
        localStorage.setItem(phrasesKey, JSON.stringify(remaining));
    } catch (error) {
        pageStatus.textContent = sphT("sph.removeFail", "Could not remove the phrase.");
        return;
    }

    phrases = remaining;
    showSavedPhrases();
    pageStatus.textContent = sphT("sph.removed", "Phrase removed.");

    // Keyboard प्रयोगकर्ताका लागि focus अर्को Remove बटनमा राख्ने
    const buttons = savedList.querySelectorAll("button");
    if (buttons.length > 0) {
        buttons[Math.min(index, buttons.length - 1)].focus();
    } else {
        document.querySelector(".saved-back").focus();
    }
}

// List लाई page मा देखाउने
function showSavedPhrases() {
    if (!savedList) return;
    savedList.replaceChildren();
    emptyMessage.hidden = phrases.length > 0;

    phrases.forEach(function (text, index) {
        const item = document.createElement("li");
        item.className = "saved-phrase-item";

        const textBox = document.createElement("div");

        const japanese = document.createElement("p");
        japanese.lang = "ja";
        japanese.className = "saved-japanese";
        japanese.textContent = text;
        textBox.append(japanese);

        // phrases-data.js मा भेटिए अर्थ पनि देखाउने
        const info = (typeof findPhraseByJapanese === "function") ? findPhraseByJapanese(text) : null;
        if (info) {
            const meaning = document.createElement("p");
            meaning.className = "saved-meaning";
            meaning.textContent = info.reading + " · " + info.english;

            // UI भाषामा अर्थ (अङ्ग्रेजी सधैं माथि देखिन्छ)
            let savedLang = "en";
            try {
                if (window.LBT && typeof window.LBT.lang === "function") { savedLang = window.LBT.lang(); }
                else { savedLang = document.documentElement.getAttribute("lang") || "en"; }
            } catch (e2) { savedLang = "en"; }
            let savedMeaning = "";
            if (savedLang === "ne") { savedMeaning = info.nepali || ""; }
            else if (savedLang === "vi") { savedMeaning = info.vi || ""; }
            else if (savedLang === "my") { savedMeaning = info.my || ""; }
            const nepali = document.createElement("p");
            nepali.lang = savedLang;
            nepali.className = "saved-meaning";
            nepali.textContent = savedMeaning;

            textBox.append(meaning);
            if (savedMeaning) { textBox.append(nepali); }
        }

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "btn";
        removeButton.textContent = sphT("sph.remove", "Remove");
        removeButton.setAttribute("aria-label", sphT("sph.removeAria", "Remove: {t}").replace("{t}", text));
        removeButton.addEventListener("click", function () {
            removePhrase(index);
        });

        item.append(textBox, removeButton);
        savedList.append(item);
    });
}

showSavedPhrases();

// भाषा फेरिँदा list फेरि देखाउने (जापानी/reading/अर्थ उस्तै रहन्छ)
if (savedList) {
    document.addEventListener("lb:lang", function () {
        showSavedPhrases();
    });
}
