/* LifeBridge Japan — lightweight UI translations (header, footer, home page).
 * Languages: English (en), Nepali (ne), Vietnamese (vi), Burmese (my).
 * The choice is stored in localStorage as "lb_lang" and applied on every page.
 * Elements opt in with data-i18n="key" (plain text), data-i18n-html="key"
 * (markup such as the hero title's line break), or data-i18n-placeholder="key".
 * Anything without a matching key stays in English.
 */
(function () {
    "use strict";

    var STORE_KEY = "lb_lang";
    var SUPPORTED = ["en", "ne", "vi", "my"];

    var I18N = {
        en: {
            "nav.home": "Home",
            "nav.start": "Start Here",
            "nav.guides": "Guides",
            "nav.jobs": "Jobs",
            "nav.japanese": "Japanese help",
            "nav.emergency": "Emergency",
            "nav.qa": "Q&A",
            "nav.profile": "Demo Profile",
            "footer.tagline": "Your everyday guide to living in Japan.",
            "hero.title": "New to Japan?<br> Know what to do next.",
            "hero.subtitle": "Simple step-by-step guides for documents, housing, jobs, money, Japanese and everyday life in Japan.",
            "hero.start": "Start My Journey \u2192",
            "hero.guides": "Explore Guides",
            "hero.explain": "Explain a notice",
            "search.title": "What do you need help with today?",
            "search.placeholder": "Try: find a job, open a bank account, move house",
            "search.button": "Search",
            "topics.title": "Everything you need for life in Japan",
            "topics.subtitle": "Choose a topic and follow simple step-by-step instructions.",
            "topic.housing.title": "Housing",
            "topic.housing.sub": "Apartments, moving and utilities",
            "topic.jobs.title": "Jobs",
            "topic.jobs.sub": "Part-time jobs and work basics",
            "topic.documents.title": "Documents",
            "topic.documents.sub": "Residence card and procedures",
            "topic.money.title": "Money",
            "topic.money.sub": "Banking, salary and daily expenses",
            "topic.transport.title": "Transportation",
            "topic.transport.sub": "Trains, buses and IC cards",
            "topic.health.title": "Health",
            "topic.health.sub": "Hospitals and health insurance",
            "topic.japanese.title": "Japanese",
            "topic.japanese.sub": "Useful Japanese phrases for daily life",
            "topic.emergency.title": "Emergency",
            "topic.emergency.sub": "What to do when something goes wrong"
        },
        ne: {
            "nav.home": "गृहपृष्ठ",
            "nav.start": "यहाँबाट सुरु गर्नुहोस्",
            "nav.guides": "निर्देशिकाहरू",
            "nav.jobs": "रोजगार",
            "nav.japanese": "जापानी सहयोग",
            "nav.emergency": "आपतकालीन",
            "nav.qa": "प्रश्न-उत्तर",
            "nav.profile": "डेमो प्रोफाइल",
            "footer.tagline": "जापानमा तपाईंको दैनिक जीवनका लागि मार्गदर्शक।",
            "hero.title": "जापानमा नयाँ हुनुहुन्छ?<br> अब के गर्ने जान्नुहोस्।",
            "hero.subtitle": "जापानमा कागजात, आवास, काम, पैसा, जापानी भाषा र दैनिक जीवनका लागि सरल चरण-दर-चरण मार्गदर्शन।",
            "hero.start": "मेरो यात्रा सुरु गर्नुहोस् \u2192",
            "hero.guides": "निर्देशिकाहरू हेर्नुहोस्",
            "hero.explain": "सूचना बुझ्नुहोस्",
            "search.title": "आज तपाईंलाई के सहयोग चाहिन्छ?",
            "search.placeholder": "खोज्नुहोस्: काम खोज्ने, बैंक खाता खोल्ने, घर सर्ने",
            "search.button": "खोज्नुहोस्",
            "topics.title": "जापानमा जीवनका लागि आवश्यक सबै कुरा",
            "topics.subtitle": "विषय छान्नुहोस् र सरल चरण-दर-चरण निर्देशन पालना गर्नुहोस्।",
            "topic.housing.title": "आवास",
            "topic.housing.sub": "अपार्टमेन्ट, घर सर्ने र उपयोगिताहरू",
            "topic.jobs.title": "रोजगार",
            "topic.jobs.sub": "पार्ट-टाइम काम र कामका आधारभूत कुरा",
            "topic.documents.title": "कागजातहरू",
            "topic.documents.sub": "निवास कार्ड र प्रक्रियाहरू",
            "topic.money.title": "पैसा",
            "topic.money.sub": "बैंकिङ, तलब र दैनिक खर्च",
            "topic.transport.title": "यातायात",
            "topic.transport.sub": "रेल, बस र IC कार्ड",
            "topic.health.title": "स्वास्थ्य",
            "topic.health.sub": "अस्पताल र स्वास्थ्य बीमा",
            "topic.japanese.title": "जापानी",
            "topic.japanese.sub": "दैनिक जीवनका लागि उपयोगी जापानी वाक्यांश",
            "topic.emergency.title": "आपतकालीन",
            "topic.emergency.sub": "केही गलत हुँदा के गर्ने"
        },
        vi: {
            "nav.home": "Trang chủ",
            "nav.start": "Bắt đầu tại đây",
            "nav.guides": "Hướng dẫn",
            "nav.jobs": "Việc làm",
            "nav.japanese": "Hỗ trợ tiếng Nhật",
            "nav.emergency": "Khẩn cấp",
            "nav.qa": "Hỏi & Đáp",
            "nav.profile": "Hồ sơ demo",
            "footer.tagline": "Người bạn đồng hành mỗi ngày của bạn tại Nhật Bản.",
            "hero.title": "Mới đến Nhật Bản?<br> Biết ngay việc cần làm tiếp theo.",
            "hero.subtitle": "Hướng dẫn từng bước đơn giản về giấy tờ, nhà ở, việc làm, tiền bạc, tiếng Nhật và cuộc sống hằng ngày tại Nhật Bản.",
            "hero.start": "Bắt đầu hành trình \u2192",
            "hero.guides": "Khám phá hướng dẫn",
            "hero.explain": "Giải thích thông báo",
            "search.title": "Hôm nay bạn cần giúp gì?",
            "search.placeholder": "Thử: tìm việc làm, mở tài khoản ngân hàng, chuyển nhà",
            "search.button": "Tìm kiếm",
            "topics.title": "Mọi thứ bạn cần cho cuộc sống tại Nhật Bản",
            "topics.subtitle": "Chọn một chủ đề và làm theo hướng dẫn từng bước đơn giản.",
            "topic.housing.title": "Nhà ở",
            "topic.housing.sub": "Căn hộ, chuyển nhà và tiện ích",
            "topic.jobs.title": "Việc làm",
            "topic.jobs.sub": "Việc làm bán thời gian và kiến thức cơ bản",
            "topic.documents.title": "Giấy tờ",
            "topic.documents.sub": "Thẻ cư trú và thủ tục",
            "topic.money.title": "Tiền bạc",
            "topic.money.sub": "Ngân hàng, lương và chi tiêu hằng ngày",
            "topic.transport.title": "Giao thông",
            "topic.transport.sub": "Tàu điện, xe buýt và thẻ IC",
            "topic.health.title": "Sức khỏe",
            "topic.health.sub": "Bệnh viện và bảo hiểm y tế",
            "topic.japanese.title": "Tiếng Nhật",
            "topic.japanese.sub": "Mẫu câu tiếng Nhật hữu ích cho cuộc sống hằng ngày",
            "topic.emergency.title": "Khẩn cấp",
            "topic.emergency.sub": "Cần làm gì khi có sự cố"
        },
        my: {
            "nav.home": "ပင်မစာမျက်နှာ",
            "nav.start": "ဒီနေရာက စတင်ပါ",
            "nav.guides": "လမ်းညွှန်များ",
            "nav.jobs": "အလုပ်အကိုင်",
            "nav.japanese": "ဂျပန်စာ အကူအညီ",
            "nav.emergency": "အရေးပေါ်",
            "nav.qa": "အမေး-အဖြေ",
            "nav.profile": "စမ်းသပ် ပရိုဖိုင်",
            "footer.tagline": "ဂျပန်နိုင်ငံရှိ သင့်နေ့စဉ်ဘဝအတွက် လမ်းညွှန်။",
            "hero.title": "ဂျပန်ကို အခုမှ ရောက်တာလား?<br> နောက်ဘာလုပ်ရမလဲ သိအောင်လုပ်ပါ။",
            "hero.subtitle": "ဂျပန်နိုင်ငံရှိ စာရွက်စာတမ်း၊ အိမ်ရာ၊ အလုပ်၊ ငွေကြေး၊ ဂျပန်စာနှင့် နေ့စဉ်ဘဝအတွက် ရိုးရှင်းသော အဆင့်ဆင့် လမ်းညွှန်များ။",
            "hero.start": "ကျွန်ုပ်၏ ခရီးစဉ် စတင်မယ် \u2192",
            "hero.guides": "လမ်းညွှန်များ ကြည့်မယ်",
            "hero.explain": "အကြောင်းကြားစာ ရှင်းပြမယ်",
            "search.title": "ဒီနေ့ ဘာကူညီပေးရမလဲ?",
            "search.placeholder": "စမ်းကြည့်ပါ- အလုပ်ရှာရန်၊ ဘဏ်အကောင့်ဖွင့်ရန်၊ အိမ်ပြောင်းရန်",
            "search.button": "ရှာမယ်",
            "topics.title": "ဂျပန်မှာ နေထိုင်ဖို့ လိုအပ်သမျှ အားလုံး",
            "topics.subtitle": "အကြောင်းအရာတစ်ခု ရွေးပြီး ရိုးရှင်းသော အဆင့်ဆင့် ညွှန်ကြားချက်များကို လိုက်နာပါ။",
            "topic.housing.title": "အိမ်ရာ",
            "topic.housing.sub": "တိုက်ခန်း၊ အိမ်ပြောင်းခြင်းနှင့် အသုံးအဆောင်များ",
            "topic.jobs.title": "အလုပ်အကိုင်",
            "topic.jobs.sub": "အချိန်ပိုင်း အလုပ်နှင့် အလုပ်အခြေခံများ",
            "topic.documents.title": "စာရွက်စာတမ်းများ",
            "topic.documents.sub": "နေထိုင်ခွင့်ကတ်နှင့် လုပ်ထုံးများ",
            "topic.money.title": "ငွေကြေး",
            "topic.money.sub": "ဘဏ်၊ လစာနှင့် နေ့စဉ်အသုံးစရိတ်",
            "topic.transport.title": "သယ်ယူပို့ဆောင်ရေး",
            "topic.transport.sub": "ရထား၊ ဘတ်စ်ကားနှင့် IC ကတ်",
            "topic.health.title": "ကျန်းမာရေး",
            "topic.health.sub": "ဆေးရုံနှင့် ကျန်းမာရေး အာမခံ",
            "topic.japanese.title": "ဂျပန်စာ",
            "topic.japanese.sub": "နေ့စဉ်ဘဝအတွက် အသုံးဝင်သော ဂျပန်စကားစုများ",
            "topic.emergency.title": "အရေးပေါ်",
            "topic.emergency.sub": "တစ်ခုခု မှားယွင်းနေရင် ဘာလုပ်ရမလဲ"
        }
    };

    function getLang() {
        try {
            var saved = window.localStorage.getItem(STORE_KEY);
            if (SUPPORTED.indexOf(saved) !== -1) return saved;
        } catch (e) { /* private mode etc. — fall through to English */ }
        return "en";
    }

    function lookup(lang, key) {
        if (I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
        return I18N.en[key];
    }

    function apply(lang) {
        if (SUPPORTED.indexOf(lang) === -1) lang = "en";
        document.documentElement.setAttribute("lang", lang);

        var i, el, key, value;

        var textEls = document.querySelectorAll("[data-i18n]");
        for (i = 0; i < textEls.length; i++) {
            el = textEls[i];
            key = el.getAttribute("data-i18n");
            value = lookup(lang, key);
            if (value !== undefined) el.textContent = value;
        }

        var htmlEls = document.querySelectorAll("[data-i18n-html]");
        for (i = 0; i < htmlEls.length; i++) {
            el = htmlEls[i];
            key = el.getAttribute("data-i18n-html");
            value = lookup(lang, key);
            if (value !== undefined) el.innerHTML = value;
        }

        var phEls = document.querySelectorAll("[data-i18n-placeholder]");
        for (i = 0; i < phEls.length; i++) {
            el = phEls[i];
            key = el.getAttribute("data-i18n-placeholder");
            value = lookup(lang, key);
            if (value !== undefined) el.setAttribute("placeholder", value);
        }

        var select = document.getElementById("lang-select");
        if (select) select.value = lang;
    }

    function setLang(lang) {
        if (SUPPORTED.indexOf(lang) === -1) lang = "en";
        try {
            window.localStorage.setItem(STORE_KEY, lang);
        } catch (e) { /* ignore — translations still apply for this page view */ }
        apply(lang);
    }

    document.addEventListener("DOMContentLoaded", function () {
        var select = document.getElementById("lang-select");
        if (select) {
            select.addEventListener("change", function () {
                setLang(select.value);
            });
        }
        apply(getLang());
    });

    window.LifeBridgeI18n = { apply: apply, set: setLang, get: getLang };
})();
