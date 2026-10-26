// ============================================================
// main.js
// Home, Start Here र Japanese help page मा चल्छ।
//   १. Journey checklist र progress
//   २. जापानी वाक्य card (category, Listen, Copy, Save)
// वाक्यहरू phrases-data.js मा छन्।
// ============================================================


// ------------------------------------------------------------
// १. Journey checklist
// Checklist का कामहरू यहाँ एकै ठाउँमा छन्।
// HTML मा <ul id="journey-list"> खाली छ, यहीँबाट भरिन्छ।
// ------------------------------------------------------------
const journeyTasks = [
    { id: "address", text: "Register your home address" },
    { id: "insurance", text: "Join a health insurance plan" },
    { id: "ic-card", text: "Get an IC card for trains and buses" },
    { id: "mobile", text: "Get a SIM card and set up your mobile service" },
    { id: "bank", text: "Open a bank account" },
    { id: "job", text: "Find a part-time job" }
];

const journeyList = document.querySelector("#journey-list");
const progressBar = document.querySelector("#journey-progress-bar");
const progressText = document.querySelector("#journey-progress-text");

// Browser मा tick सेभ गर्ने नाम
function taskStorageKey(taskId) {
    return "lifego-task-" + taskId;
}

// एउटा काम tick छ कि छैन पढ्ने
function isTaskDone(taskId) {
    try {
        return localStorage.getItem(taskStorageKey(taskId)) === "true";
    } catch (error) {
        return false;
    }
}

// कति काम सकियो गनेर progress bar बदल्ने
function updateJourneyProgress() {
    const total = journeyTasks.length;
    let completed = 0;

    for (const task of journeyTasks) {
        if (isTaskDone(task.id)) {
            completed = completed + 1;
        }
    }

    const percentage = Math.round((completed / total) * 100);

    progressBar.value = percentage;
    progressBar.textContent = percentage + "%";
    progressText.textContent =
        completed + " of " + total + " tasks completed · " + percentage + "%";
}

// Checklist भएको page मा मात्र चलाउने
if (journeyList && progressBar && progressText) {

    for (const task of journeyTasks) {
        const item = document.createElement("li");
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");

        checkbox.type = "checkbox";
        checkbox.checked = isTaskDone(task.id);
        text.textContent = task.text;

        // Tick लगाउँदा वा हटाउँदा सेभ गरेर progress बदल्ने
        checkbox.addEventListener("change", function () {
            try {
                localStorage.setItem(taskStorageKey(task.id), String(checkbox.checked));
            } catch (error) {
                progressText.textContent = "Could not save your tick. Check your browser storage settings.";
                return;
            }
            updateJourneyProgress();
        });

        label.append(checkbox, text);
        item.append(label);
        journeyList.append(item);
    }

    updateJourneyProgress();
}


// ------------------------------------------------------------
// २. जापानी वाक्य card
// ------------------------------------------------------------
const phraseCard = document.querySelector(".phrase-card");
const categoryButtons = document.querySelectorAll(".phrase-categories button");
const savedPhrasesKey = "lifego-saved-phrases";

// अहिले कुन category छानिएको छ
let currentCategory = "hospital";

// Browser मा सेभ भएका वाक्यहरू पढ्ने
function readSavedPhrases() {
    try {
        const stored = JSON.parse(localStorage.getItem(savedPhrasesKey) || "[]");
        if (Array.isArray(stored)) {
            return stored.filter(function (item) {
                return typeof item === "string";
            });
        }
    } catch (error) {
        // पढ्न नसके खाली list
    }
    return [];
}

// Card भएको page मा मात्र चलाउने
if (phraseCard && categoryButtons.length > 0) {

    const categoryLabel = phraseCard.querySelector(".phrase-category");
    const japaneseText = phraseCard.querySelector("#japanese-phrase");
    const readingText = phraseCard.querySelector(".phrase-reading");
    const englishText = phraseCard.querySelector(".phrase-meaning");
    const nepaliText = phraseCard.querySelector(".phrase-nepali");
    const listenButton = phraseCard.querySelector("#listen-btn");
    const copyButton = phraseCard.querySelector("#copy-btn");
    const saveButton = phraseCard.querySelector("#save-phrase-btn");
    const statusText = phraseCard.querySelector("#phrase-status");

    // Save बटनको text: सेभ छ भने "Saved", नत्र "Save"
    function updateSaveButton() {
        const isSaved = readSavedPhrases().includes(phraseExamples[currentCategory].japanese);
        saveButton.textContent = isSaved ? "★ Saved" : "☆ Save";
        saveButton.setAttribute("aria-pressed", String(isSaved));
    }

    // Card मा छानिएको category को वाक्य देखाउने
    function showPhrase(category) {
        const example = phraseExamples[category];
        if (!example) return;

        currentCategory = category;

        categoryLabel.textContent = example.category;
        japaneseText.textContent = example.japanese;
        readingText.textContent = example.reading;
        englishText.textContent = example.english;
        nepaliText.textContent = example.nepali;
        statusText.textContent = "";

        // छानिएको बटनमा निलो धर्सो
        for (const button of categoryButtons) {
            button.setAttribute("aria-pressed", String(button.dataset.category === category));
        }

        updateSaveButton();
    }

    // Category बटन थिच्दा
    for (const button of categoryButtons) {
        button.addEventListener("click", function () {
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel(); // पुरानो आवाज रोक्ने
            }
            showPhrase(button.dataset.category);
        });
    }

    // Listen: जापानी वाक्य पढेर सुनाउने
    listenButton.addEventListener("click", function () {
        if (!("speechSynthesis" in window)) {
            statusText.textContent = "This browser cannot read text aloud.";
            return;
        }

        const speech = new SpeechSynthesisUtterance(phraseExamples[currentCategory].japanese);
        speech.lang = "ja-JP";
        speech.rate = 0.85;

        speech.onstart = function () {
            statusText.textContent = "Playing…";
        };
        speech.onend = function () {
            statusText.textContent = "";
        };
        speech.onerror = function (event) {
            if (event.error !== "canceled" && event.error !== "interrupted") {
                statusText.textContent = "Could not play audio. Check that your device has a Japanese voice.";
            }
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    });

    // Copy: जापानी वाक्य कपी गर्ने
    copyButton.addEventListener("click", function () {
        if (!navigator.clipboard) {
            statusText.textContent = "Copy is not available here. Select the phrase and copy it yourself.";
            return;
        }

        navigator.clipboard.writeText(phraseExamples[currentCategory].japanese)
            .then(function () {
                statusText.textContent = "Phrase copied.";
            })
            .catch(function () {
                statusText.textContent = "Copy did not work. Select the phrase and copy it yourself.";
            });
    });

    // Save: वाक्य सेभ गर्ने वा हटाउने
    saveButton.addEventListener("click", function () {
        const text = phraseExamples[currentCategory].japanese;
        let saved = readSavedPhrases();
        const wasSaved = saved.includes(text);

        if (wasSaved) {
            saved = saved.filter(function (item) {
                return item !== text;
            });
        } else {
            saved.push(text);
        }

        try {
            localStorage.setItem(savedPhrasesKey, JSON.stringify(saved));
        } catch (error) {
            statusText.textContent = "Could not save the phrase. Check your browser storage settings.";
            return;
        }

        updateSaveButton();
        statusText.textContent = wasSaved ? "Removed from Saved Phrases." : "Phrase saved.";
    });

    // Page खुल्दा पहिलो वाक्य देखाउने
    showPhrase(currentCategory);
}
