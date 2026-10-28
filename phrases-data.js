// ============================================================
// phrases-data.js
// जापानी वाक्यहरू एकै ठाउँमा। हरेक category मा वाक्यहरूको list छ।
// Home, Japanese help र Saved Phrases तीनै page ले यही file पढ्छन्।
// नयाँ वाक्य थप्न यहाँ मात्र थप्नुहोस् (category list मा थप्ने)।
// ============================================================

const phraseExamples = {
    hospital: {
        category: "Hospital",
        phrases: [
            {
                japanese: "頭が痛いです。",
                reading: "Atama ga itai desu.",
                english: "My head hurts.",
                nepali: "मेरो टाउको दुखेको छ।"
            },
            {
                japanese: "熱があります。",
                reading: "Netsu ga arimasu.",
                english: "I have a fever.",
                nepali: "मलाई ज्वरो आएको छ।"
            },
            {
                japanese: "保険証を忘れました。",
                reading: "Hokenshou o wasuremashita.",
                english: "I forgot my insurance card.",
                nepali: "मैले बीमा कार्ड बिर्सेछु।"
            }
        ]
    },

    "city-hall": {
        category: "City Hall",
        phrases: [
            {
                japanese: "住所を登録したいです。",
                reading: "Juusho o touroku shitai desu.",
                english: "I would like to register my address.",
                nepali: "म आफ्नो ठेगाना दर्ता गर्न चाहन्छु।"
            },
            {
                japanese: "この書類の書き方を教えてください。",
                reading: "Kono shorui no kakikata o oshiete kudasai.",
                english: "Please show me how to fill out this form.",
                nepali: "यो फारम कसरी भर्ने सिकाइदिनुहोस्।"
            },
            {
                japanese: "通訳はいますか。",
                reading: "Tsuuyaku wa imasu ka.",
                english: "Is there an interpreter?",
                nepali: "दोभासे हुनुहुन्छ?"
            }
        ]
    },

    work: {
        category: "Work",
        phrases: [
            {
                japanese: "もう一度説明していただけますか。",
                reading: "Mou ichido setsumei shite itadakemasu ka.",
                english: "Could you explain that again?",
                nepali: "कृपया फेरि बुझाइदिन सक्नुहुन्छ?"
            },
            {
                japanese: "お疲れ様です。",
                reading: "Otsukaresama desu.",
                english: "Hello (workplace greeting).",
                nepali: "नमस्कार (काममा भेट्दा/छुट्टिँदा भनिने)।"
            },
            {
                japanese: "休みを取らせていただけますか。",
                reading: "Yasumi o torasete itadakemasu ka.",
                english: "May I take time off?",
                nepali: "के म बिदा लिन सक्छु?"
            }
        ]
    },

    train: {
        category: "Train",
        phrases: [
            {
                japanese: "この電車は新宿に行きますか。",
                reading: "Kono densha wa Shinjuku ni ikimasu ka.",
                english: "Does this train go to Shinjuku?",
                nepali: "के यो रेल शिन्जुकु जान्छ?"
            },
            {
                japanese: "すみません、切符売り場はどこですか。",
                reading: "Sumimasen, kippu uriba wa doko desu ka.",
                english: "Excuse me, where is the ticket counter?",
                nepali: "माफ गर्नुहोस्, टिकट काउन्टर कहाँ छ?"
            },
            {
                japanese: "何番線ですか。",
                reading: "Nanbansen desu ka.",
                english: "Which platform is it?",
                nepali: "कुन प्लेटफर्म हो?"
            }
        ]
    },

    shopping: {
        category: "Shopping",
        phrases: [
            {
                japanese: "これはいくらですか。",
                reading: "Kore wa ikura desu ka.",
                english: "How much is this?",
                nepali: "यसको मूल्य कति हो?"
            },
            {
                japanese: "クレジットカードは使えますか。",
                reading: "Kurejitto kaado wa tsukaemasu ka.",
                english: "Can I use a credit card?",
                nepali: "के क्रेडिट कार्ड चल्छ?"
            },
            {
                japanese: "袋をいただけますか。",
                reading: "Fukuro o itadakemasu ka.",
                english: "May I have a bag, please?",
                nepali: "कृपया झोला दिनुहोस्।"
            }
        ]
    }
};

// जापानी वाक्य दिएपछि त्यसको पूरा जानकारी खोज्ने
// (Saved Phrases page मा अर्थ देखाउन चाहिन्छ)
function findPhraseByJapanese(text) {
    for (const key in phraseExamples) {
        const group = phraseExamples[key];
        const list = group && Array.isArray(group.phrases) ? group.phrases : [];
        for (const phrase of list) {
            if (phrase && phrase.japanese === text) {
                return phrase;
            }
        }
    }
    return null;
}
