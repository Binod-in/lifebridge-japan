// ============================================================
// guide-data.js
// Search, Guides र Saved Guides page का लागि ८ वटा topic।
//   id       = page को नाम (id + ".html" खुल्छ)
//   icon     = icons folder भित्रको file
//   image    = images folder भित्रको banner file (Guides card header)
//   keywords = खोज्दा भेटिने शब्द (English, नेपाली, 日本語, Tiếng Việt, မြန်မာ)
// ============================================================

const guideData = [
    {
        id: "housing",
        title: "Housing",
        icon: "icons/home.svg",
        image: "images/housing.webp",
        description: "Apartments, moving and utilities",
        keywords: "house home apartment move moving rent room utilities घर कोठा भाडा 住居 引越し thuê nhà thue nha căn hộ can ho phòng phong tiền cọc tien coc အိမ် အခန်း ငှားခ တိုက်ခန်း စပေါ်",
        i18n: { titleKey: "topic.housing.title", descKey: "topic.housing.sub" }
    },
    {
        id: "jobs",
        title: "Jobs",
        icon: "icons/briefcase.svg",
        image: "images/jobs.webp",
        description: "Prepare for a part-time job search",
        keywords: "job jobs work part-time arubaito baito काम जागिर 仕事 アルバイト việc làm viec lam công việc cong viec lương luong အလုပ် လစာ အလုပ်ရှာ",
        i18n: { titleKey: "topic.jobs.title", descKey: "gd.jobs.desc" }
    },
    {
        id: "documents",
        title: "Documents",
        icon: "icons/document.svg",
        image: "images/documents.webp",
        description: "Organize your residence and address paperwork",
        keywords: "residence card address register document documents कागजात ठेगाना 在留カード 住所 giấy tờ giay to thẻ cư trú the cu tru địa chỉ dia chi visa thị thực thi thuc rác rac စာရွက်စာတမ်း နေထိုင်ခွင့်ကတ် လိပ်စာ ဗီဇာ အမှိုက်",
        i18n: { titleKey: "topic.documents.title", descKey: "gd.documents.desc" }
    },
    {
        id: "money",
        title: "Money",
        icon: "icons/yen.svg",
        image: "images/money.webp",
        description: "Prepare for banking and everyday expenses",
        keywords: "bank account money salary banking budget पैसा बैंक 銀行 口座 ngân hàng ngan hang tiền tien thuế thue ဘဏ် ပိုက်ဆံ အခွန်",
        i18n: { titleKey: "topic.money.title", descKey: "gd.money.desc" }
    },
    {
        id: "transport",
        title: "Transportation",
        icon: "icons/train.svg",
        image: "images/transport.webp",
        description: "Plan your route and learn to use local transport",
        keywords: "train bus ic card suica pasmo travel transport रेल यातायात 電車 交通 tàu tau xe buýt xe buyt giao thông giao thong ရထား ဘတ်စ်ကား သယ်ယူပို့ဆောင်ရေး",
        i18n: { titleKey: "topic.transport.title", descKey: "gd.transport.desc" }
    },
    {
        id: "health",
        title: "Health",
        icon: "icons/heart.svg",
        image: "images/health.webp",
        description: "Prepare for appointments and insurance questions",
        keywords: "hospital health insurance doctor clinic स्वास्थ्य अस्पताल बीमा 病院 保険 bệnh viện benh vien sức khỏe suc khoe bác sĩ bac si ဆေးရုံ ကျန်းမာရေး ဆရာဝန်",
        i18n: { titleKey: "topic.health.title", descKey: "gd.health.desc" }
    },
    {
        id: "japanese",
        title: "Japanese",
        icon: "icons/chat.svg",
        image: "images/japanese.webp",
        description: "Useful phrases with English and Nepali meanings",
        keywords: "japanese language phrase phrases nihongo जापानी भाषा 日本語 tiếng nhật tieng nhat ဂျပန်စာ ဂျပန်ဘာသာ စကား",
        i18n: { titleKey: "topic.japanese.title", descKey: "gd.japanese.desc" }
    },
    {
        id: "emergency",
        title: "Emergency",
        icon: "icons/alert.svg",
        image: "images/emergency.webp",
        description: "Important contacts and lost-item next steps",
        keywords: "emergency police fire ambulance lost help आपतकाल प्रहरी 緊急 警察 khẩn cấp khan cap cảnh sát canh sat cứu hỏa cuu hoa mất mat အရေးပေါ် ရဲ မီးသတ် လူနာတင်ယာဉ် ပျောက်",
        i18n: { titleKey: "topic.emergency.title", descKey: "gd.emergency.desc" }
    }
];

// ------------------------------------------------------------
// अनुवाद हेल्पर: card मा देखिने title/description हालको भाषामा दिने।
// i18n तयार नहुँदासम्म अङ्ग्रेजी title/description फर्काउँछ।
// keywords सधैं अङ्ग्रेजी नै रहन्छ (खोजी मिलाउन)।
// ------------------------------------------------------------
function guideTitle(guide) {
    try {
        if (guide && guide.i18n && guide.i18n.titleKey &&
            window.LBT && typeof window.LBT.t === "function") {
            const value = window.LBT.t(guide.i18n.titleKey);
            if (typeof value === "string" && value !== "" && value !== guide.i18n.titleKey) {
                return value;
            }
        }
    } catch (error) {
        // तल अङ्ग्रेजी fallback
    }
    return guide ? guide.title : "";
}

function guideDesc(guide) {
    try {
        if (guide && guide.i18n && guide.i18n.descKey &&
            window.LBT && typeof window.LBT.t === "function") {
            const value = window.LBT.t(guide.i18n.descKey);
            if (typeof value === "string" && value !== "" && value !== guide.i18n.descKey) {
                return value;
            }
        }
    } catch (error) {
        // तल अङ्ग्रेजी fallback
    }
    return guide ? guide.description : "";
}
