// ============================================================
// phrases-data.js
// जापानी वाक्यहरू एकै ठाउँमा।
// Home, Japanese help र Saved Phrases तीनै page ले यही file पढ्छन्।
// नयाँ वाक्य थप्न यहाँ मात्र थप्नुहोस्।
// ============================================================

const phraseExamples = {
    hospital: {
        category: "Hospital",
        japanese: "頭が痛いです。",
        reading: "Atama ga itai desu.",
        english: "My head hurts.",
        nepali: "मेरो टाउको दुखेको छ।"
    },

    "city-hall": {
        category: "City Hall",
        japanese: "住所を登録したいです。",
        reading: "Juusho o touroku shitai desu.",
        english: "I would like to register my address.",
        nepali: "म आफ्नो ठेगाना दर्ता गर्न चाहन्छु।"
    },

    work: {
        category: "Work",
        japanese: "もう一度説明していただけますか。",
        reading: "Mou ichido setsumei shite itadakemasu ka.",
        english: "Could you explain that again?",
        nepali: "कृपया फेरि बुझाइदिन सक्नुहुन्छ?"
    },

    train: {
        category: "Train",
        japanese: "この電車は新宿に行きますか。",
        reading: "Kono densha wa Shinjuku ni ikimasu ka.",
        english: "Does this train go to Shinjuku?",
        nepali: "के यो रेल शिन्जुकु जान्छ?"
    },

    shopping: {
        category: "Shopping",
        japanese: "これはいくらですか。",
        reading: "Kore wa ikura desu ka.",
        english: "How much is this?",
        nepali: "यसको मूल्य कति हो?"
    }
};

// जापानी वाक्य दिएपछि त्यसको पूरा जानकारी खोज्ने
// (Saved Phrases page मा अर्थ देखाउन चाहिन्छ)
function findPhraseByJapanese(text) {
    for (const key in phraseExamples) {
        if (phraseExamples[key].japanese === text) {
            return phraseExamples[key];
        }
    }
    return null;
}
