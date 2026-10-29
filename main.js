// ============================================================
// main.js
// Home, Start Here र Japanese help page मा चल्छ।
//   १. Journey checklist र progress
//   २. जापानी वाक्य card (category, Listen, Copy, Save)
// वाक्यहरू phrases-data.js मा छन्।
// ============================================================


// i18n तयार नहुँदासम्म अङ्ग्रेजी fallback दिने सुरक्षित lookup
function mainT(key, fallback) {
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


// ------------------------------------------------------------
// १. Journey checklist
// Checklist का कामहरू यहाँ एकै ठाउँमा छन्।
// HTML मा <ul id="journey-list"> खाली छ, यहीँबाट भरिन्छ।
// start.html मा ?situation= हेरेर सूची छानिन्छ।
// ------------------------------------------------------------
const defaultJourneyTasks = [
    { id: "address", text: "Register your home address" },
    { id: "insurance", text: "Join a health insurance plan" },
    { id: "ic-card", text: "Get an IC card for trains and buses" },
    { id: "mobile", text: "Get a SIM card and set up your mobile service" },
    { id: "bank", text: "Open a bank account" },
    { id: "job", text: "Find a part-time job" }
];

const senmonJourneyTasks = [
    { id: "senmon-field", text: "Decide your field of study (IT, nursing care, cooking, design and so on)" },
    { id: "senmon-japanese", text: "Check the Japanese requirement — most schools ask for JLPT N2" },
    { id: "senmon-shortlist", text: "Shortlist schools and check their admission schedules" },
    { id: "senmon-docs", text: "Prepare documents: passport, residence card, school transcripts, bank statement" },
    { id: "senmon-apply", text: "Apply and take the entrance exam and interview" },
    { id: "senmon-fees", text: "Pay the admission fees and complete enrollment" },
    { id: "senmon-visa", text: "Confirm your student visa status after enrollment" }
];

const universityJourneyTasks = [
    { id: "univ-faculty", text: "Decide your faculty and the language of instruction (Japanese or English program)" },
    { id: "univ-eju", text: "Check the EJU and JLPT requirements for your choices" },
    { id: "univ-shortlist", text: "Shortlist universities — application windows differ by school" },
    { id: "univ-docs", text: "Prepare documents and your statement of purpose" },
    { id: "univ-exam", text: "Take the entrance exam or document screening and interview" },
    { id: "univ-fees", text: "Pay the fees and complete enrollment" },
    { id: "univ-visa", text: "Confirm your student visa status after enrollment" }
];

const studentJourneyTasks = [
    { id: "stu-orient", text: "Attend your school orientation" },
    { id: "stu-baito", text: "Get permission before starting part-time work" },
    { id: "stu-insurance", text: "Join a health insurance plan" },
    { id: "stu-bank", text: "Open a bank account" },
    { id: "stu-ic", text: "Get an IC card for trains and buses" },
    { id: "stu-address", text: "Register your address if you move" }
];

const workerJourneyTasks = [
    { id: "work-contract", text: "Check your work contract and working hours" },
    { id: "work-tax", text: "Learn about tax and pension deductions" },
    { id: "work-insurance", text: "Join the employee health insurance" },
    { id: "work-bank", text: "Open a bank account for your salary" },
    { id: "work-commute", text: "Plan your commute route" },
    { id: "work-emergency", text: "Save emergency contacts" }
];

const movingJourneyTasks = [
    { id: "move-notice", text: "Submit a moving-out notice at your old office" },
    { id: "move-address", text: "Register your new address within 14 days" },
    { id: "move-util", text: "Set up electricity, gas and water" },
    { id: "move-internet", text: "Arrange your internet connection" },
    { id: "move-post", text: "Forward your mail to the new address" },
    { id: "move-update", text: "Update your address on bank and insurance" }
];

// Guide page बाट start.html?guide=<id> आए त्यस guide का कामहरू
const housingJourneyTasks = [
    { id: "housing-budget", text: "Decide your budget including initial costs" },
    { id: "housing-visit", text: "Visit rooms and check light, noise and station walk" },
    { id: "housing-breakdown", text: "Get a written cost breakdown from the agent" },
    { id: "housing-contract", text: "Sign the contract and arrange utilities and internet" },
    { id: "housing-register", text: "Register your new address within 14 days" },
    { id: "housing-update", text: "Update your address with bank, employer and post office" }
];

const jobsJourneyTasks = [
    { id: "jobs-permission", text: "Confirm you are allowed to work (students need permission)" },
    { id: "jobs-search", text: "Search Hello Work and note pay, duties and station" },
    { id: "jobs-resume", text: "Prepare your résumé and weekly availability" },
    { id: "jobs-apply", text: "Apply and attend the interview with your residence card" },
    { id: "jobs-conditions", text: "Read the written employment conditions before day one" },
    { id: "jobs-bank", text: "Give the employer your bank details for salary" }
];

const documentsJourneyTasks = [
    { id: "documents-counter", text: "Find the moving-in counter at your ward office" },
    { id: "documents-form", text: "Fill in and submit the moving-in form" },
    { id: "documents-card", text: "Get your new address printed on your residence card" },
    { id: "documents-insurance", text: "Ask about health insurance and pension enrollment" },
    { id: "documents-copies", text: "Keep copies of every receipt and letter" },
    { id: "documents-deadlines", text: "Save your next deadlines in Important Dates" }
];

const moneyJourneyTasks = [
    { id: "money-compare", text: "Compare banks for fees, hours and English support" },
    { id: "money-account", text: "Open an account with ID, seal and phone number" },
    { id: "money-auto", text: "Set up automatic payments for rent and bills" },
    { id: "money-budget", text: "Write a monthly budget with the Money Tracker" },
    { id: "money-folder", text: "Keep tax and pension letters in one folder" },
    { id: "money-ask", text: "Ask your employer about anything unclear" }
];

const transportJourneyTasks = [
    { id: "transport-route", text: "Look up your route and last train time" },
    { id: "transport-ic", text: "Get an IC card at the station" },
    { id: "transport-pass", text: "Ask about a commuter pass for daily travel" },
    { id: "transport-dest", text: "Keep your destination written in Japanese" },
    { id: "transport-app", text: "Install a route search app for backup" },
    { id: "transport-ask", text: "Ask station staff when you are lost" }
];

const healthJourneyTasks = [
    { id: "health-enroll", text: "Enroll in health insurance (company or ward office)" },
    { id: "health-clinic", text: "Find a nearby clinic and check hours and languages" },
    { id: "health-notes", text: "Write down symptoms, medicines and questions" },
    { id: "health-visit", text: "Bring your My Number health insurance card (マイナ保険証) or 資格確認書, and arrive early" },
    { id: "health-receipts", text: "Keep receipts and follow treatment instructions" },
    { id: "health-checkup", text: "Ask about yearly health checkups" }
];

const japaneseJourneyTasks = [
    { id: "jap-pick", text: "Pick one phrase category and read today's phrase" },
    { id: "jap-listen", text: "Listen and repeat until it feels natural" },
    { id: "jap-copy", text: "Copy a phrase into your message or dictionary app" },
    { id: "jap-save", text: "Save phrases you will reuse" },
    { id: "jap-daily", text: "Use one new phrase in a real conversation daily" },
    { id: "jap-review", text: "Review Saved Phrases before going out" }
];

const emergencyJourneyTasks = [
    { id: "emerg-110", text: "Memorize 110 for police and 119 for fire/ambulance" },
    { id: "emerg-address", text: "Keep your address written in Japanese in your wallet" },
    { id: "emerg-card", text: "Carry your My Number health insurance card (マイナ保険証) or 資格確認書" },
    { id: "emerg-phone", text: "Keep your phone charged with numbers saved" },
    { id: "emerg-7119", text: "Check if #7119 advice line works in your area" },
    { id: "emerg-contacts", text: "Save family and school contacts for emergencies" }
];

const journeySituation = new URLSearchParams(location.search).get("situation") || "";
const journeyGuide = new URLSearchParams(location.search).get("guide") || "";
const journeyTaskLists = {
    "senmon-school": senmonJourneyTasks,
    "university": universityJourneyTasks,
    "student": studentJourneyTasks,
    "worker": workerJourneyTasks,
    "moving-home": movingJourneyTasks
};
const guideTaskLists = {
    "housing": housingJourneyTasks,
    "jobs": jobsJourneyTasks,
    "documents": documentsJourneyTasks,
    "money": moneyJourneyTasks,
    "transport": transportJourneyTasks,
    "health": healthJourneyTasks,
    "japanese": japaneseJourneyTasks,
    "emergency": emergencyJourneyTasks
};
// ?guide= आए guide सूची, नत्र ?situation=, नत्र default (arrival) सूची
const journeyTasks = guideTaskLists[journeyGuide] || journeyTaskLists[journeySituation] || defaultJourneyTasks;

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
        mainT("main.progress", "{c} of {t} tasks completed · {p}%")
            .replace("{c}", String(completed))
            .replace("{t}", String(total))
            .replace("{p}", String(percentage));
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
        text.setAttribute("data-i18n", "journey.task." + task.id);

        // Tick लगाउँदा वा हटाउँदा सेभ गरेर progress बदल्ने
        checkbox.addEventListener("change", function () {
            try {
                localStorage.setItem(taskStorageKey(task.id), String(checkbox.checked));
            } catch (error) {
                progressText.textContent = mainT("main.tickFail", "Could not save your tick. Check your browser storage settings.");
                return;
            }
            updateJourneyProgress();
        });

        label.append(checkbox, text);
        item.append(label);
        journeyList.append(item);
    }

    updateJourneyProgress();

    // भाषा फेरिँदा progress पाठ फेरि देखाउने (task नाम data-i18n बाट फेरिन्छ)
    document.addEventListener("lb:lang", updateJourneyProgress);
}

// Official school search card: study situations मा मात्र देखाउने
const schoolSearchCard = document.querySelector("#school-search-card");
if (schoolSearchCard) {
    schoolSearchCard.hidden = journeySituation !== "senmon-school" && journeySituation !== "university";
}


// ------------------------------------------------------------
// २. जापानी वाक्य card
// ------------------------------------------------------------
const phraseCard = document.querySelector(".phrase-card");
const categoryButtons = document.querySelectorAll(".phrase-categories button");
const savedPhrasesKey = "lifego-saved-phrases";

// अहिले कुन category र कुन नम्बरको वाक्य छानिएको छ
let currentCategory = "hospital";
let currentIndex = 0;

// छानिएको category का वाक्यहरू (phrases-data.js नआए खाली)
function phraseList(category) {
    try {
        const group = typeof phraseExamples !== "undefined" ? phraseExamples[category] : null;
        if (group && Array.isArray(group.phrases)) return group.phrases;
    } catch (error) {
        // तल खाली list
    }
    return [];
}

function currentPhrase() {
    const list = phraseList(currentCategory);
    return list.length > 0 ? list[currentIndex % list.length] : null;
}

function uiLang() {
    try {
        if (window.LBT && typeof window.LBT.lang === "function") return window.LBT.lang();
        return document.documentElement.getAttribute("lang") || "en";
    } catch (error) {
        return "en";
    }
}

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

    // अघिल्लो/अर्को वाक्य बटन (phrases-data.js कै आधारमा बन्छ)
    const phraseNav = document.createElement("div");
    phraseNav.className = "phrase-nav";
    const prevButton = document.createElement("button");
    prevButton.type = "button";
    prevButton.className = "btn";
    const phraseCounter = document.createElement("span");
    phraseCounter.className = "phrase-count";
    phraseCounter.setAttribute("role", "status");
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "btn";
    phraseNav.append(prevButton, phraseCounter, nextButton);
    phraseCard.append(phraseNav);

    function updatePhraseNav(total) {
        prevButton.textContent = mainT("jap.prev", "← Previous");
        nextButton.textContent = mainT("jap.next", "Next →");
        phraseCounter.textContent = mainT("jap.count", "{i} of {n}")
            .replace("{i}", String(currentIndex + 1))
            .replace("{n}", String(total));
        prevButton.disabled = total <= 1;
        nextButton.disabled = total <= 1;
    }

    prevButton.addEventListener("click", function () {
        showPhrase(currentCategory, currentIndex - 1);
    });
    nextButton.addEventListener("click", function () {
        showPhrase(currentCategory, currentIndex + 1);
    });

    // Save बटनको text: सेभ छ भने "Saved", नत्र "Save"
    function updateSaveButton() {
        const savedPhrase = currentPhrase();
        const isSaved = savedPhrase ? readSavedPhrases().includes(savedPhrase.japanese) : false;
        saveButton.textContent = isSaved ? mainT("main.saveOn", "★ Saved") : mainT("main.saveOff", "☆ Save");
        saveButton.setAttribute("aria-pressed", String(isSaved));
    }

    // Card मा छानिएको category को नम्बर अनुसारको वाक्य देखाउने
    function showPhrase(category, index) {
        const list = phraseList(category);
        if (list.length === 0) {
            statusText.textContent = mainT("main.noPhrases", "Phrases could not be loaded. Please reload the page.");
            return;
        }

        currentCategory = category;
        currentIndex = (((typeof index === "number" ? index : 0) % list.length) + list.length) % list.length;
        const example = list[currentIndex];

        // Category नाम पहिल्यै भएको phrases.tab.* key बाट (अङ्ग्रेजी मिल्छ)
        const group = phraseExamples[category] || {};
        const tabKey = category === "city-hall" ? "cityhall" : category;
        categoryLabel.textContent = mainT("phrases.tab." + tabKey, group.category || category);
        japaneseText.textContent = example.japanese;
        readingText.textContent = example.reading;
        englishText.textContent = example.english;
        // UI भाषामा अर्थ (अङ्ग्रेजी सधैं माथि देखिन्छ)
        const langNow = uiLang();
        let localMeaning = "";
        if (langNow === "ne") { localMeaning = example.nepali || ""; }
        else if (langNow === "vi") { localMeaning = example.vi || ""; }
        else if (langNow === "my") { localMeaning = example.my || ""; }
        nepaliText.hidden = !localMeaning;
        nepaliText.textContent = localMeaning;
        nepaliText.setAttribute("lang", langNow);
        statusText.textContent = "";

        updatePhraseNav(list.length);

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
            showPhrase(button.dataset.category, 0);
        });
    }

    // Listen: जापानी वाक्य पढेर सुनाउने
    listenButton.addEventListener("click", function () {
        if (!("speechSynthesis" in window)) {
            statusText.textContent = mainT("main.noTTS", "This browser cannot read text aloud.");
            return;
        }

        const spoken = currentPhrase();
        if (!spoken) return;
        const speech = new SpeechSynthesisUtterance(spoken.japanese);
        speech.lang = "ja-JP";
        speech.rate = 0.85;

        speech.onstart = function () {
            statusText.textContent = mainT("main.playing", "Playing…");
        };
        speech.onend = function () {
            statusText.textContent = "";
        };
        speech.onerror = function (event) {
            if (event.error !== "canceled" && event.error !== "interrupted") {
                statusText.textContent = mainT("main.audioFail", "Could not play audio. Check that your device has a Japanese voice.");
            }
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(speech);
    });

    // Copy: जापानी वाक्य कपी गर्ने
    copyButton.addEventListener("click", function () {
        if (!navigator.clipboard) {
            statusText.textContent = mainT("main.copyUnavailable", "Copy is not available here. Select the phrase and copy it yourself.");
            return;
        }

        const copied = currentPhrase();
        if (!copied) return;
        navigator.clipboard.writeText(copied.japanese)
            .then(function () {
                statusText.textContent = mainT("main.copied", "Phrase copied.");
            })
            .catch(function () {
                statusText.textContent = mainT("main.copyFail", "Copy did not work. Select the phrase and copy it yourself.");
            });
    });

    // Save: वाक्य सेभ गर्ने वा हटाउने
    saveButton.addEventListener("click", function () {
        const current = currentPhrase();
        if (!current) return;
        const text = current.japanese;
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
            statusText.textContent = mainT("main.phraseSaveFail", "Could not save the phrase. Check your browser storage settings.");
            return;
        }

        updateSaveButton();
        statusText.textContent = wasSaved ? mainT("main.phraseRemoved", "Removed from Saved Phrases.") : mainT("main.phraseKept", "Phrase saved.");
    });

    // Page खुल्दा पहिलो वाक्य देखाउने
    showPhrase(currentCategory, 0);

    // भाषा फेरिँदा card फेरि देखाउने (जापानी/reading/अर्थ उस्तै रहन्छ)
    document.addEventListener("lb:lang", function () {
        showPhrase(currentCategory, currentIndex);
    });
}
