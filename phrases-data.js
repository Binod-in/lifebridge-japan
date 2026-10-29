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
                nepali: "मेरो टाउको दुखेको छ।",
                vi: "Tôi bị đau đầu.",
                my: "ကျွန်တော် ခေါင်းကိုက်နေပါတယ်။"
            },
            {
                japanese: "熱があります。",
                reading: "Netsu ga arimasu.",
                english: "I have a fever.",
                nepali: "मलाई ज्वरो आएको छ।",
                vi: "Tôi bị sốt.",
                my: "ကျွန်တော် အဖျားရှိနေပါတယ်။"
            },
            {
                japanese: "マイナ保険証を忘れました。",
                reading: "Maina hokenshou o wasuremashita.",
                english: "I forgot my My Number health insurance card.",
                nepali: "मैले माई नम्बर बीमा कार्ड बिर्सेँ।",
                vi: "Tôi quên thẻ bảo hiểm y tế My Number.",
                my: "ကျွန်တော် My Number ကျန်းမာရေးအာမခံကတ် မေ့ကျန်ခဲ့ပါတယ်။"
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
                nepali: "म आफ्नो ठेगाना दर्ता गर्न चाहन्छु।",
                vi: "Tôi muốn đăng ký địa chỉ.",
                my: "ကျွန်တော် လိပ်စာ မှတ်ပုံတင်ချင်ပါတယ်။"
            },
            {
                japanese: "この書類の書き方を教えてください。",
                reading: "Kono shorui no kakikata o oshiete kudasai.",
                english: "Please show me how to fill out this form.",
                nepali: "यो फारम कसरी भर्ने सिकाइदिनुहोस्।",
                vi: "Xin hãy chỉ cho tôi cách điền mẫu đơn này.",
                my: "ဒီဖောင်ကို ဘယ်လိုဖြည့်ရမလဲ ပြပေးပါ။"
            },
            {
                japanese: "通訳はいますか。",
                reading: "Tsuuyaku wa imasu ka.",
                english: "Is there an interpreter?",
                nepali: "दोभासे हुनुहुन्छ?",
                vi: "Có phiên dịch viên không?",
                my: "စကားပြန် ရှိပါသလား။"
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
                nepali: "कृपया फेरि बुझाइदिन सक्नुहुन्छ?",
                vi: "Bạn có thể giải thích lại được không?",
                my: "အဲဒါကို ထပ်ရှင်းပြပေးနိုင်မလား။"
            },
            {
                japanese: "お疲れ様です。",
                reading: "Otsukaresama desu.",
                english: "Hello (workplace greeting).",
                nepali: "नमस्कार (काममा भेट्दा/छुट्टिँदा भनिने)।",
                vi: "Xin chào (câu chào ở nơi làm việc).",
                my: "မင်္ဂလာပါ (အလုပ်ခွင်နှုတ်ဆက်စကား)။"
            },
            {
                japanese: "休みを取らせていただけますか。",
                reading: "Yasumi o torasete itadakemasu ka.",
                english: "May I take time off?",
                nepali: "के म बिदा लिन सक्छु?",
                vi: "Tôi có thể xin nghỉ phép được không?",
                my: "ကျွန်တော် ခွင့်ယူလို့ရမလား။"
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
                nepali: "के यो रेल शिन्जुकु जान्छ?",
                vi: "Tàu này có đi Shinjuku không?",
                my: "ဒီရထား ရှင်ဂျုကု သွားလား။"
            },
            {
                japanese: "すみません、切符売り場はどこですか。",
                reading: "Sumimasen, kippu uriba wa doko desu ka.",
                english: "Excuse me, where is the ticket counter?",
                nepali: "माफ गर्नुहोस्, टिकट काउन्टर कहाँ छ?",
                vi: "Xin lỗi, quầy bán vé ở đâu?",
                my: "တောင်းပန်ပါတယ်၊ လက်မှတ်ကောင်တာ ဘယ်မှာလဲ။"
            },
            {
                japanese: "何番線ですか。",
                reading: "Nanbansen desu ka.",
                english: "Which platform is it?",
                nepali: "कुन प्लेटफर्म हो?",
                vi: "Đó là sân ga số mấy?",
                my: "ဘယ်ပလက်ဖောင်းလဲ။"
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
                nepali: "यसको मूल्य कति हो?",
                vi: "Cái này bao nhiêu tiền?",
                my: "ဒါ ဘယ်လောက်လဲ။"
            },
            {
                japanese: "クレジットカードは使えますか。",
                reading: "Kurejitto kaado wa tsukaemasu ka.",
                english: "Can I use a credit card?",
                nepali: "के क्रेडिट कार्ड चल्छ?",
                vi: "Tôi có thể dùng thẻ tín dụng không?",
                my: "ခရက်ဒစ်ကတ် သုံးလို့ရလား။"
            },
            {
                japanese: "袋をいただけますか。",
                reading: "Fukuro o itadakemasu ka.",
                english: "May I have a bag, please?",
                nepali: "कृपया झोला दिनुहोस्။",
                vi: "Cho tôi xin một cái túi.",
                my: "အိတ်တစ်လုံး ပေးပါ။"
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
