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
const appStatus = document.querySelector("#app-status"); function appT(key, fallback) { try { if (window.LBT && typeof window.LBT.t === "function") { var av = window.LBT.t(key); if (typeof av === "string" && av !== "" && av !== key) return av; } } catch (e) {} return fallback; }

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
        showAppStatus(appT("app.storageSaveFail", "Could not save. Check your browser storage settings."));
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
        button.textContent = isSaved ? appT("app.unsave", "★ Saved (tap to remove)") : appT("app.save", "☆ Save guide");
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
        message.textContent = wasSaved ? appT("app.guideRemoved", "Guide removed.") : appT("app.guideSaved", "Guide saved.");
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
    link.textContent = ((typeof guideTitle === "function") ? guideTitle(guide) : guide.title) + " →";
    title.append(link);

    const description = document.createElement("p");
    description.textContent = (typeof guideDesc === "function") ? guideDesc(guide) : guide.description;

    // Guides page मा card को header image देखाउने (Search/Saved मा होइन)
    if (currentPage === "guide.html" && guide.image) {
        const photo = document.createElement("img");
        photo.className = "guide-card-image";
        photo.src = guide.image;
        photo.alt = "";
        photo.loading = "lazy";
        card.append(photo);
    }

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
            summary.textContent = appT("app.searchNone", "No guides found for “{q}”. Try a topic such as bank, job or hospital.").replace("{q}", query);
        } else if (query === "") {
            summary.textContent = appT("app.searchAll", "Showing all {n} guides.").replace("{n}", String(shownGuides.length));
        } else {
            const word = shownGuides.length === 1 ? "guide" : "guides"; // i18n: एकवचन/बहुवचन तलका key बाट
            summary.textContent = appT(shownGuides.length === 1 ? "app.searchFoundOne" : "app.searchFoundMany", shownGuides.length === 1 ? "{n} guide found for “{q}”." : "{n} guides found for “{q}”.").replace("{n}", String(shownGuides.length)).replace("{q}", query);
        }
    }

    window.__lbSearch = { q: query, n: shownGuides.length }; const emptyMessage = document.querySelector("#saved-guide-empty");
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
    link.textContent = displayName ? appT("app.myProfile", "My Profile") : appT("nav.profile", "Demo Profile");
}

const profileForm = document.querySelector("#profile-form");
if (profileForm) {
    const nameInput = document.querySelector("#display-name");
    nameInput.value = displayName;

    profileForm.addEventListener("submit", function (event) {
        event.preventDefault(); // page reload हुन नदिने

        const name = nameInput.value.trim();
        if (name === "") {
            nameInput.setCustomValidity(appT("app.enterName", "Please enter a display name."));
            nameInput.reportValidity();
            return;
        }
        nameInput.setCustomValidity("");

        if (saveData("lifego-profile", { name: name })) {
            showAppStatus(appT("app.welcome", "Welcome, {name}! Your demo profile is saved on this browser.").replace("{name}", name));
            for (const link of headerProfileLinks) {
                link.textContent = appT("app.myProfile", "My Profile");
            }
        }
    });

    nameInput.addEventListener("input", function () {
        nameInput.setCustomValidity("");
    });
}

const profileSummary = document.querySelector("#profile-summary");
if (profileSummary) {
    profileSummary.textContent = displayName ? appT("app.profileName", "Display name: {name}").replace("{name}", displayName) : appT("app.noProfile", "No display name saved yet.");
}


// ------------------------------------------------------------
// ५. Start Here को सुझाव plan
// ?situation=student जस्तो URL बाट अवस्था पढ्छ
// ------------------------------------------------------------
const plans = {
    "new-arrival": {
        title: "Just arrived", titleKey: "app.plan.new-arrival.title",
        description: "Start by checking address procedures, health coverage and essential services.", descKey: "app.plan.new-arrival.desc",
        guides: ["documents", "health", "money", "transport"]
    },
    student: {
        title: "Studying in Japan", titleKey: "journey.opt.student",
        description: "Ask your school about orientation, documents and any conditions for part-time work.", descKey: "app.plan.student.desc",
        guides: ["documents", "jobs", "japanese", "money"]
    },
    worker: {
        title: "Starting work", titleKey: "app.plan.worker.title",
        description: "Prepare questions about employment conditions, travel and your daily budget.", descKey: "app.plan.worker.desc",
        guides: ["jobs", "transport", "money"]
    },
    "moving-home": {
        title: "Moving home", titleKey: "app.plan.moving-home.title",
        description: "Plan your move, utilities and address updates.", descKey: "app.plan.moving-home.desc",
        guides: ["housing", "documents", "money"]
    },
    "senmon-school": {
        title: "Finding a vocational school", titleKey: "app.plan.senmon-school.title",
        description: "Compare courses, entry requirements, tuition and application dates directly with each school.", descKey: "app.plan.senmon-school.desc",
        guides: ["japanese", "documents", "money"]
    },
    university: {
        title: "Finding a university", titleKey: "app.plan.university.title",
        description: "List your preferred programs and confirm admission requirements and deadlines with each university.", descKey: "app.plan.university.desc",
        guides: ["japanese", "documents", "money"]
    }
};

const planTitle = document.querySelector("#plan-title");
if (planTitle) {
    let situation = new URLSearchParams(location.search).get("situation") || "new-arrival";
    if (!(situation in plans)) {
        situation = "new-arrival"; // गलत मान आए सुरुकै plan
    }

    const guideParam = new URLSearchParams(location.search).get("guide") || "";
    const guideEntry = guideData.find(function (item) { return item.id === guideParam; }) || null;
    const plan = guideEntry ? { title: guideEntry.title, titleKey: (guideEntry.i18n && guideEntry.i18n.titleKey) || "", description: guideEntry.description, descKey: (guideEntry.i18n && guideEntry.i18n.descKey) || "", guides: [guideEntry.id] } : plans[situation];
    window.__lbPlan = situation; window.__lbPlanData = plan;
    planTitle.textContent = displayName ? displayName + ", " + appT(plan.titleKey, plan.title).toLowerCase() : appT(plan.titleKey, plan.title);
    document.querySelector("#plan-description").textContent = appT(plan.descKey, plan.description);
    document.querySelector("#journey-status").value = situation;

    const linkBox = document.querySelector("#plan-links");
    for (const guideId of plan.guides) {
        const guide = guideData.find(function (item) {
            return item.id === guideId;
        });
        const link = document.createElement("a");
        link.className = "btn";
        link.href = guideId + ".html";
        link.textContent = ((typeof guideTitle === "function") ? guideTitle(guide) : guide.title) + " →";
        linkBox.append(link);
    }
}


// ------------------------------------------------------------
// ६. Important Dates
// ------------------------------------------------------------
const dateForm = document.querySelector("#date-form"); /* i18n: भाषा फेरिँदा bookmark + guide card + search summary */ document.addEventListener("lb:lang", function () { updateBookmarkButtons(); if (typeof guideData !== "undefined") { var cards = document.querySelectorAll("#guide-results article"); for (var ci = 0; ci < cards.length; ci++) { var ca = cards[ci].querySelector("h2 a"); if (!ca) continue; var gid = String(ca.getAttribute("href") || "").replace(".html", ""); var gg = null; for (var gj = 0; gj < guideData.length; gj++) { if (guideData[gj].id === gid) gg = guideData[gj]; } if (!gg) continue; ca.textContent = ((typeof guideTitle === "function") ? guideTitle(gg) : gg.title) + " →"; var cdp = cards[ci].querySelector("p"); if (cdp) cdp.textContent = (typeof guideDesc === "function") ? guideDesc(gg) : gg.description; } } if (window.__lbSearch) { var sq = window.__lbSearch.q, sn = window.__lbSearch.n; var sse = document.querySelector("#search-summary"); if (sse) { if (sn === 0) { sse.textContent = appT("app.searchNone", "No guides found for “{q}”. Try a topic such as bank, job or hospital.").replace("{q}", sq); } else if (sq === "") { sse.textContent = appT("app.searchAll", "Showing all {n} guides.").replace("{n}", String(sn)); } else { sse.textContent = appT(sn === 1 ? "app.searchFoundOne" : "app.searchFoundMany", sn === 1 ? "{n} guide found for “{q}”." : "{n} guides found for “{q}”.").replace("{n}", String(sn)).replace("{q}", sq); } } } });
const datesKey = "lifego-dates"; /* i18n: भाषा फेरिँदा profile + plan + dates */ document.addEventListener("lb:lang", function () { var hls = document.querySelectorAll('.header-act a[href="login.html"]'); for (var hi = 0; hi < hls.length; hi++) { hls[hi].textContent = displayName ? appT("app.myProfile", "My Profile") : appT("nav.profile", "Demo Profile"); } var ps2 = document.querySelector("#profile-summary"); if (ps2) { ps2.textContent = displayName ? appT("app.profileName", "Display name: {name}").replace("{name}", displayName) : appT("app.noProfile", "No display name saved yet."); } if (window.__lbPlanData || (window.__lbPlan && plans[window.__lbPlan])) { var pl = window.__lbPlanData || plans[window.__lbPlan]; var pt = document.querySelector("#plan-title"); if (pt) pt.textContent = displayName ? displayName + ", " + appT(pl.titleKey, pl.title).toLowerCase() : appT(pl.titleKey, pl.title); var pd = document.querySelector("#plan-description"); if (pd) pd.textContent = appT(pl.descKey, pl.description); var lb = document.querySelector("#plan-links"); if (lb && typeof guideData !== "undefined") { lb.replaceChildren(); for (var pi = 0; pi < pl.guides.length; pi++) { var pg = null; for (var pj = 0; pj < guideData.length; pj++) { if (guideData[pj].id === pl.guides[pi]) pg = guideData[pj]; } if (!pg) continue; var pa = document.createElement("a"); pa.className = "btn"; pa.href = pl.guides[pi] + ".html"; pa.textContent = ((typeof guideTitle === "function") ? guideTitle(pg) : pg.title) + " →"; lb.append(pa); } } } if (document.querySelector("#date-form")) { showDates(); } });

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
        empty.textContent = appT("app.noDates", "No dates added yet.");
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
        removeButton.textContent = appT("app.remove", "Remove");
        removeButton.setAttribute("aria-label", appT("app.removeDate", "Remove {t}").replace("{t}", item.title));
        removeButton.addEventListener("click", function () {
            const remaining = readDates().filter(function (d) {
                return d.id !== item.id;
            });
            if (saveData(datesKey, remaining)) {
                showDates();
                showAppStatus(appT("app.dateRemoved", "Date removed."));
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
            showAppStatus(appT("app.dateSaved", "Date saved."));
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
        const sure = confirm(appT("app.resetConfirm", "Remove all LifeBridge saved tasks, phrases, guides, dates and demo profile from this browser?"));
        if (!sure) return;

        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                if (key.startsWith("lifego-") || key === "lb_money_entries" || key === "lb_money_goals") {
                    localStorage.removeItem(key);
                }
            }
            showAppStatus(appT("app.dataReset", "LifeBridge data reset."));
            if (profileSummary) {
                profileSummary.textContent = appT("app.noProfile", "No display name saved yet.");
            }
        } catch (error) {
            showAppStatus(appT("app.storageResetFail", "Could not reset browser storage."));
        }
    });
}
