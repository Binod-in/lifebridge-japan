// ============================================================
// app.js
// धेरै page मा चल्ने साझा code।
//   १. Browser मा पढ्ने र सेभ गर्ने
//   २. Guide सेभ (bookmark) गर्ने
//   ३. Search, Guides र Saved Guides को list
//   ४. Demo profile
//   ५. Start Here को सुझाव plan
//   ६. Important Dates
//   ७. Settings: data reset
// सबै data यही browser मा मात्र बस्छ।
// ============================================================

const currentPage = location.pathname.split("/").pop() || "index.html";
const appStatus = document.querySelector("#app-status");

// Page मा सन्देश देखाउने (सन्देशको ठाउँ भएमा मात्र)
function showAppStatus(message) {
    if (appStatus) {
        appStatus.textContent = message;
    }
}


// ------------------------------------------------------------
// १. Browser मा पढ्ने र सेभ गर्ने
// ------------------------------------------------------------
function readData(key, defaultValue) {
    try {
        const saved = localStorage.getItem(key);
        if (saved === null) {
            return defaultValue;
        }
        return JSON.parse(saved);
    } catch (error) {
        return defaultValue;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        showAppStatus("Could not save. Check your browser storage settings.");
        return false;
    }
}

// Text मात्र भएको list पढ्ने (गलत data आए हटाउने)
function readTextList(key) {
    const value = readData(key, []);
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter(function (item) {
        return typeof item === "string";
    });
}


// ------------------------------------------------------------
// २. Guide सेभ (bookmark) गर्ने
// data-save-guide="housing" भएका बटनहरू
// ------------------------------------------------------------
const savedGuidesKey = "lifego-saved-guides";

function updateBookmarkButtons() {
    const saved = readTextList(savedGuidesKey);
    const buttons = document.querySelectorAll("[data-save-guide]");

    for (const button of buttons) {
        const isSaved = saved.includes(button.dataset.saveGuide);
        button.textContent = isSaved ? "★ Saved (tap to remove)" : "☆ Save guide";
        button.setAttribute("aria-pressed", String(isSaved));
    }
}

// Page मा जुनसुकै bookmark बटन थिचे पनि यहाँ आउँछ
// (Search page मा बटन पछि बन्ने भएकाले document मा एउटै listener)
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-save-guide]");
    if (!button) return;

    const guideId = button.dataset.saveGuide;
    let saved = readTextList(savedGuidesKey);
    const wasSaved = saved.includes(guideId);

    if (wasSaved) {
        saved = saved.filter(function (id) {
            return id !== guideId;
        });
    } else {
        saved.push(guideId);
    }

    if (!saveData(savedGuidesKey, saved)) return;

    updateBookmarkButtons();

    const message = button.parentElement.querySelector(".save-status");
    if (message) {
        message.textContent = wasSaved ? "Guide removed." : "Guide saved.";
    }

    // Saved Guides page मा हटाएको card पनि हटाउने
    if (currentPage === "saved-guides.html" && wasSaved) {
        button.closest("article").remove();
        const remainingCards = document.querySelectorAll("#guide-results article").length;
        document.querySelector("#saved-guide-empty").hidden = remainingCards > 0;
        document.querySelector(".saved-back").focus();
    }
});


// ------------------------------------------------------------
// ३. Search, Guides र Saved Guides को list
// ------------------------------------------------------------
const guideResults = document.querySelector("#guide-results");

// ठूलो/सानो अक्षर र full-width अक्षर मिलाउने
function normalizeText(value) {
    return value.normalize("NFKC").toLowerCase().trim();
}

// खोज्दा नगन्ने साना शब्दहरू
const ignoredWords = ["a", "an", "the", "i", "to", "how", "do", "can", "my", "in",
    "japan", "find", "open", "get", "near", "me", "for"];

// एउटा guide को card बनाउने
function makeGuideCard(guide) {
    const card = document.createElement("article");
    card.className = "detail-card";

    const icon = document.createElement("img");
    icon.className = "topic-icon";
    icon.src = guide.icon;
    icon.alt = "";

    const title = document.createElement("h2");
    const link = document.createElement("a");
    link.href = guide.id + ".html";
    link.textContent = guide.title + " →";
    title.append(link);

    const description = document.createElement("p");
    description.textContent = guide.description;

    card.append(icon, title, description);

    // Japanese र Emergency आफैंमा tool page हुन्, तिनलाई bookmark बटन नदिने
    if (guide.id !== "japanese" && guide.id !== "emergency") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn";
        button.dataset.saveGuide = guide.id;

        const message = document.createElement("p");
        message.className = "save-status";
        message.setAttribute("role", "status");

        card.append(button, message);
    }

    return card;
}

if (guideResults && typeof guideData !== "undefined") {
    const query = new URLSearchParams(location.search).get("q") || "";

    // Search page मा खोजेको शब्द box मा फेरि देखाउने
    const queryInput = document.querySelector("#results-query");
    if (queryInput) {
        queryInput.value = query;
    }

    const words = normalizeText(query).split(/\s+/).filter(function (word) {
        return word !== "" && !ignoredWords.includes(word);
    });

    let shownGuides = guideData;

    // Search: कुनै एउटा शब्द मिले पनि देखाउने
    if (currentPage === "search.html" && words.length > 0) {
        shownGuides = guideData.filter(function (guide) {
            const allText = normalizeText(guide.title + " " + guide.description + " " + guide.keywords);
            return words.some(function (word) {
                return allText.includes(word);
            });
        });
    }

    // Saved Guides: सेभ गरेका मात्र
    if (currentPage === "saved-guides.html") {
        const saved = readTextList(savedGuidesKey);
        shownGuides = guideData.filter(function (guide) {
            return saved.includes(guide.id);
        });
    }

    for (const guide of shownGuides) {
        guideResults.append(makeGuideCard(guide));
    }

    // Search को नतिजा सन्देश
    const summary = document.querySelector("#search-summary");
    if (summary) {
        if (shownGuides.length === 0) {
            summary.textContent = "No guides found for “" + query + "”. Try a topic such as bank, job or hospital.";
        } else if (query === "") {
            summary.textContent = "Showing all " + shownGuides.length + " guides.";
        } else {
            const word = shownGuides.length === 1 ? "guide" : "guides";
            summary.textContent = shownGuides.length + " " + word + " found for “" + query + "”.";
        }
    }

    const emptyMessage = document.querySelector("#saved-guide-empty");
    if (emptyMessage) {
        emptyMessage.hidden = shownGuides.length > 0;
    }
}

updateBookmarkButtons();


// ------------------------------------------------------------
// ४. Demo profile
// ------------------------------------------------------------
const profile = readData("lifego-profile", {});
let displayName = "";
if (profile && typeof profile.name === "string") {
    displayName = profile.name;
}

// Header को profile link: नाम सेभ छ भने "My Profile"
const headerProfileLinks = document.querySelectorAll('.header-act a[href="login.html"]');
for (const link of headerProfileLinks) {
    link.textContent = displayName ? "My Profile" : "Demo Profile";
}

const profileForm = document.querySelector("#profile-form");
if (profileForm) {
    const nameInput = document.querySelector("#display-name");
    nameInput.value = displayName;

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault(); // page reload हुन नदिने

        const name = nameInput.value.trim();
        if (name === "") {
            nameInput.setCustomValidity("Please enter a display name.");
            nameInput.reportValidity();
            return;
        }
        nameInput.setCustomValidity("");

        if (saveData("lifego-profile", { name: name })) {
            showAppStatus("Welcome, " + name + "! Your demo profile is saved on this browser.");
            for (const link of headerProfileLinks) {
                link.textContent = "My Profile";
            }
        }
    });

    nameInput.addEventListener("input", function () {
        nameInput.setCustomValidity("");
    });
}

const profileSummary = document.querySelector("#profile-summary");
if (profileSummary) {
    profileSummary.textContent = displayName ? "Display name: " + displayName : "No display name saved yet.";
}


// ------------------------------------------------------------
// ५. Start Here को सुझाव plan
// ?situation=student जस्तो URL बाट अवस्था पढ्छ
// ------------------------------------------------------------
const plans = {
    "new-arrival": {
        title: "Just arrived",
        description: "Start by checking address procedures, health coverage and essential services.",
        guides: ["documents", "health", "money", "transport"]
    },
    student: {
        title: "Studying in Japan",
        description: "Ask your school about orientation, documents and any conditions for part-time work.",
        guides: ["documents", "jobs", "japanese", "money"]
    },
    worker: {
        title: "Starting work",
        description: "Prepare questions about employment conditions, travel and your daily budget.",
        guides: ["jobs", "transport", "money"]
    },
    "moving-home": {
        title: "Moving home",
        description: "Plan your move, utilities and address updates.",
        guides: ["housing", "documents", "money"]
    },
    "senmon-school": {
        title: "Finding a vocational school",
        description: "Compare courses, entry requirements, tuition and application dates directly with each school.",
        guides: ["japanese", "documents", "money"]
    },
    university: {
        title: "Finding a university",
        description: "List your preferred programs and confirm admission requirements and deadlines with each university.",
        guides: ["japanese", "documents", "money"]
    }
};

const planTitle = document.querySelector("#plan-title");
if (planTitle) {
    let situation = new URLSearchParams(location.search).get("situation") || "new-arrival";
    if (!(situation in plans)) {
        situation = "new-arrival"; // गलत मान आए सुरुकै plan
    }

    const plan = plans[situation];
    planTitle.textContent = displayName ? displayName + ", " + plan.title.toLowerCase() : plan.title;
    document.querySelector("#plan-description").textContent = plan.description;
    document.querySelector("#journey-status").value = situation;

    const linkBox = document.querySelector("#plan-links");
    for (const guideId of plan.guides) {
        const guide = guideData.find(function (item) {
            return item.id === guideId;
        });
        const link = document.createElement("a");
        link.className = "btn";
        link.href = guideId + ".html";
        link.textContent = guide.title + " →";
        linkBox.append(link);
    }
}


// ------------------------------------------------------------
// ६. Important Dates
// ------------------------------------------------------------
const dateForm = document.querySelector("#date-form");
const datesKey = "lifego-dates";

// सेभ भएका मितिहरू पढ्ने (गलत ढाँचाका हटाउने)
function readDates() {
    const data = readData(datesKey, []);
    if (!Array.isArray(data)) {
        return [];
    }
    return data.filter(function (item) {
        return item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(item.date);
    });
}

function showDates() {
    const list = document.querySelector("#date-list");
    list.replaceChildren();

    // मिति क्रममा मिलाउने (पहिले आउने माथि)
    const items = readDates().sort(function (a, b) {
        return a.date.localeCompare(b.date);
    });

    if (items.length === 0) {
        const empty = document.createElement("li");
        empty.textContent = "No dates added yet.";
        list.append(empty);
        return;
    }

    for (const item of items) {
        const row = document.createElement("li");
        row.className = "saved-phrase-item";

        const text = document.createElement("p");
        text.textContent = item.date + " · " + item.title;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "btn";
        removeButton.textContent = "Remove";
        removeButton.setAttribute("aria-label", "Remove " + item.title);
        removeButton.addEventListener("click", function () {
            const remaining = readDates().filter(function (d) {
                return d.id !== item.id;
            });
            if (saveData(datesKey, remaining)) {
                showDates();
                showAppStatus("Date removed.");
                document.querySelector("#date-title").focus();
            }
        });

        row.append(text, removeButton);
        list.append(row);
    }
}

if (dateForm) {
    dateForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document.querySelector("#date-title").value.trim();
        const date = document.querySelector("#date-value").value;
        if (title === "" || date === "") return;

        // हरेक मितिको छुट्टै id (समय + random अंक)
        const newItem = {
            id: Date.now() + "-" + Math.floor(Math.random() * 100000),
            title: title,
            date: date
        };

        if (saveData(datesKey, readDates().concat([newItem]))) {
            dateForm.reset();
            showDates();
            showAppStatus("Date saved.");
        }
    });

    showDates();
}


// ------------------------------------------------------------
// ७. Settings: LifeBridge को data मात्र मेटाउने
// ------------------------------------------------------------
const resetButton = document.querySelector("#reset-data");
if (resetButton) {
    resetButton.addEventListener("click", function () {
        const sure = confirm("Remove all LifeBridge saved tasks, phrases, guides, dates and demo profile from this browser?");
        if (!sure) return;

        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith("lifego-")) {
                    localStorage.removeItem(key);
                }
            }
            showAppStatus("LifeBridge data reset.");
            if (profileSummary) {
                profileSummary.textContent = "No display name saved yet.";
            }
        } catch (error) {
            showAppStatus("Could not reset browser storage.");
        }
    });
}
