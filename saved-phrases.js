// ============================================================
// saved-phrases.js
// Saved Phrases page: सेभ गरेका वाक्य र तिनको अर्थ देखाउने, हटाउने।
// अर्थ phrases-data.js बाट आउँछ।
// ============================================================

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
    pageStatus.textContent = "Could not read your saved phrases.";
}

// एउटा वाक्य हटाउने
function removePhrase(index) {
    const remaining = phrases.filter(function (item, itemIndex) {
        return itemIndex !== index;
    });

    try {
        localStorage.setItem(phrasesKey, JSON.stringify(remaining));
    } catch (error) {
        pageStatus.textContent = "Could not remove the phrase.";
        return;
    }

    phrases = remaining;
    showSavedPhrases();
    pageStatus.textContent = "Phrase removed.";

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
        const info = findPhraseByJapanese(text);
        if (info) {
            const meaning = document.createElement("p");
            meaning.className = "saved-meaning";
            meaning.textContent = info.reading + " · " + info.english;

            const nepali = document.createElement("p");
            nepali.lang = "ne";
            nepali.className = "saved-meaning";
            nepali.textContent = info.nepali;

            textBox.append(meaning, nepali);
        }

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "btn";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove: " + text);
        removeButton.addEventListener("click", function () {
            removePhrase(index);
        });

        item.append(textBox, removeButton);
        savedList.append(item);
    });
}

showSavedPhrases();
