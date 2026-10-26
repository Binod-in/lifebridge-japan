// ============================================================
// guide-data.js
// Search, Guides र Saved Guides page का लागि ८ वटा topic।
//   id       = page को नाम (id + ".html" खुल्छ)
//   icon     = icons folder भित्रको file
//   keywords = खोज्दा भेटिने शब्द (English, नेपाली, 日本語)
// ============================================================

const guideData = [
    {
        id: "housing",
        title: "Housing",
        icon: "icons/home.svg",
        description: "Apartments, moving and utilities",
        keywords: "house home apartment move moving rent room utilities घर कोठा भाडा 住居 引越し"
    },
    {
        id: "jobs",
        title: "Jobs",
        icon: "icons/briefcase.svg",
        description: "Prepare for a part-time job search",
        keywords: "job jobs work part-time arubaito baito काम जागिर 仕事 アルバイト"
    },
    {
        id: "documents",
        title: "Documents",
        icon: "icons/document.svg",
        description: "Organize your residence and address paperwork",
        keywords: "residence card address register document documents कागजात ठेगाना 在留カード 住所"
    },
    {
        id: "money",
        title: "Money",
        icon: "icons/yen.svg",
        description: "Prepare for banking and everyday expenses",
        keywords: "bank account money salary banking budget पैसा बैंक 銀行 口座"
    },
    {
        id: "transport",
        title: "Transportation",
        icon: "icons/train.svg",
        description: "Plan your route and learn to use local transport",
        keywords: "train bus ic card suica pasmo travel transport रेल यातायात 電車 交通"
    },
    {
        id: "health",
        title: "Health",
        icon: "icons/heart.svg",
        description: "Prepare for appointments and insurance questions",
        keywords: "hospital health insurance doctor clinic स्वास्थ्य अस्पताल बीमा 病院 保険"
    },
    {
        id: "japanese",
        title: "Japanese",
        icon: "icons/chat.svg",
        description: "Useful phrases with English and Nepali meanings",
        keywords: "japanese language phrase phrases nihongo जापानी भाषा 日本語"
    },
    {
        id: "emergency",
        title: "Emergency",
        icon: "icons/alert.svg",
        description: "Important contacts and lost-item next steps",
        keywords: "emergency police fire ambulance lost help आपतकाल प्रहरी 緊急 警察"
    }
];
