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
            "topic.emergency.sub": "What to do when something goes wrong",
            "journey.title": "Your Japan journey, step by step.",
            "journey.desc": "Tell us your situation and explore a suggested checklist for your next steps.",
            "journey.nav.mine": "My Journey",
            "journey.nav.saved": "Saved Guides",
            "journey.nav.phrases": "Saved Phrases",
            "journey.nav.dates": "Important Dates",
            "journey.nav.settings": "Settings",
            "journey.card.title": "Your Journey",
            "journey.card.note": "Check off the tasks you have completed.",
            "journey.progress.label": "Your progress",
            "journey.task.address": "Register your home address",
            "journey.task.insurance": "Join a health insurance plan",
            "journey.task.ic-card": "Get an IC card for trains and buses",
            "journey.task.mobile": "Get a SIM card and set up your mobile service",
            "journey.task.bank": "Open a bank account",
            "journey.task.job": "Find a part-time job",
            "journey.form.situation": "Your situation",
            "journey.form.submit": "Show my plan →",
            "journey.opt.student": "Studying in Japan",
            "journey.opt.new": "Just Arrived",
            "journey.opt.work": "Starting Work",
            "journey.opt.moving": "Moving Home",
            "journey.opt.senmon": "Find vocational schools",
            "journey.opt.university": "Find a university",
            "stages.title": "Where are you in your Japan journey?",
            "stages.arrived.title": "Just Arrived",
            "stages.arrived.desc": "Start with the essential procedures for your first weeks in Japan.",
            "stages.arrived.link": "Start here →",
            "stages.student.title": "Studying in Japan",
            "stages.student.desc": "School, part-time work, money and student life.",
            "stages.student.link": "Student guide →",
            "stages.work.title": "Starting Work",
            "stages.work.desc": "Work documents, salary and workplace basics.",
            "stages.work.link": "Work guide →",
            "stages.moving.title": "Moving Home",
            "stages.moving.desc": "Address changes, utilities and moving procedures.",
            "stages.moving.link": "Moving guide →",
            "phrases.title": "Not sure what to say in Japanese?",
            "phrases.desc": "Find useful phrases for real-life situations and show them directly when you need help.",
            "phrases.tab.hospital": "Hospital",
            "phrases.tab.cityhall": "City Hall",
            "phrases.tab.work": "Work",
            "phrases.tab.train": "Train",
            "phrases.tab.shopping": "Shopping",
            "emg.title": "Need help right now?",
            "emg.desc": "Get quick information for emergencies.",
            "emg.police": "Police",
            "emg.ambulance": "Ambulance / Fire",
            "emg.medical": "Medical advice #7119",
            "emg.phone": "Lost Phone",
            "emg.bankcard": "Lost Bank Card",
            "emg.residence": "Lost Residence Card",
            "emg.open": "Open Emergency Guide",
            "faq.title": "Questions people often have",
            "faq.desc": "Find answers to common questions about living in Japan.",
            "faq.viewall": "View all questions →"
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
            "topic.emergency.sub": "केही गलत हुँदा के गर्ने",
            "journey.title": "जापानमा तपाईंको यात्रा, चरण-दर-चरण।",
            "journey.desc": "तपाईंको अवस्था बताउनुहोस् र अर्को कदमका लागि सुझाव गरिएको चेकलिस्ट हेर्नुहोस्।",
            "journey.nav.mine": "मेरो यात्रा",
            "journey.nav.saved": "सेभ गरिएका निर्देशिका",
            "journey.nav.phrases": "सेभ गरिएका वाक्यांश",
            "journey.nav.dates": "महत्त्वपूर्ण मितिहरू",
            "journey.nav.settings": "सेटिङहरू",
            "journey.card.title": "तपाईंको यात्रा",
            "journey.card.note": "पूरा गरेका कार्यहरूमा टिक लगाउनुहोस्।",
            "journey.progress.label": "तपाईंको प्रगति",
            "journey.task.address": "आफ्नो घरको ठेगाना दर्ता गर्नुहोस्",
            "journey.task.insurance": "स्वास्थ्य बीमा योजनामा सामेल हुनुहोस्",
            "journey.task.ic-card": "रेल र बसका लागि IC कार्ड लिनुहोस्",
            "journey.task.mobile": "SIM कार्ड लिनुहोस् र मोबाइल सेवा सेटअप गर्नुहोस्",
            "journey.task.bank": "बैंक खाता खोल्नुहोस्",
            "journey.task.job": "पार्ट-टाइम काम खोज्नुहोस्",
            "journey.form.situation": "तपाईंको अवस्था",
            "journey.form.submit": "मेरो योजना देखाउनुहोस् →",
            "journey.opt.student": "जापानमा अध्ययन गर्दै",
            "journey.opt.new": "भर्खरै आइपुगेको",
            "journey.opt.work": "काम सुरु गर्दै",
            "journey.opt.moving": "घर सर्दै",
            "journey.opt.senmon": "व्यावसायिक विद्यालय खोज्ने",
            "journey.opt.university": "विश्वविद्यालय खोज्ने",
            "stages.title": "जापान यात्रामा तपाईं कहाँ हुनुहुन्छ?",
            "stages.arrived.title": "भर्खरै आइपुगेको",
            "stages.arrived.desc": "जापानमा पहिलो हप्ताका आवश्यक प्रक्रियाहरूबाट सुरु गर्नुहोस्।",
            "stages.arrived.link": "यहाँबाट सुरु गर्नुहोस् →",
            "stages.student.title": "जापानमा अध्ययन गर्दै",
            "stages.student.desc": "विद्यालय, पार्ट-टाइम काम, पैसा र विद्यार्थी जीवन।",
            "stages.student.link": "विद्यार्थी निर्देशिका →",
            "stages.work.title": "काम सुरु गर्दै",
            "stages.work.desc": "कामका कागजात, तलब र कार्यस्थलका आधारभूत कुरा।",
            "stages.work.link": "काम निर्देशिका →",
            "stages.moving.title": "घर सर्दै",
            "stages.moving.desc": "ठेगाना परिवर्तन, उपयोगिता र सर्ने प्रक्रियाहरू।",
            "stages.moving.link": "सर्ने निर्देशिका →",
            "phrases.title": "जापानीमा के भन्ने थाहा छैन?",
            "phrases.desc": "वास्तविक परिस्थितिका लागि उपयोगी वाक्यांश फेला पार्नुहोस् र आवश्यक पर्दा सिधै देखाउनुहोस्।",
            "phrases.tab.hospital": "अस्पताल",
            "phrases.tab.cityhall": "सिटी हल",
            "phrases.tab.work": "काम",
            "phrases.tab.train": "रेल",
            "phrases.tab.shopping": "किनमेल",
            "emg.title": "अहिले नै सहयोग चाहिन्छ?",
            "emg.desc": "आपतकालीन अवस्थाका लागि छिटो जानकारी पाउनुहोस्।",
            "emg.police": "प्रहरी",
            "emg.ambulance": "एम्बुलेन्स / दमकल",
            "emg.medical": "चिकित्सा सल्लाह #7119",
            "emg.phone": "हराएको फोन",
            "emg.bankcard": "हराएको बैंक कार्ड",
            "emg.residence": "हराएको निवास कार्ड",
            "emg.open": "आपतकालीन निर्देशिका खोल्नुहोस्",
            "faq.title": "मानिसहरूले बारम्बार सोध्ने प्रश्नहरू",
            "faq.desc": "जापानमा बसोबासबारे सामान्य प्रश्नहरूको उत्तर पाउनुहोस्।",
            "faq.viewall": "सबै प्रश्न हेर्नुहोस् →"
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
            "topic.emergency.sub": "Cần làm gì khi có sự cố",
            "journey.title": "Hành trình Nhật Bản của bạn, từng bước một.",
            "journey.desc": "Cho chúng tôi biết hoàn cảnh của bạn và khám phá danh sách việc cần làm gợi ý cho các bước tiếp theo.",
            "journey.nav.mine": "Hành trình của tôi",
            "journey.nav.saved": "Hướng dẫn đã lưu",
            "journey.nav.phrases": "Mẫu câu đã lưu",
            "journey.nav.dates": "Ngày quan trọng",
            "journey.nav.settings": "Cài đặt",
            "journey.card.title": "Hành trình của bạn",
            "journey.card.note": "Đánh dấu các việc bạn đã hoàn thành.",
            "journey.progress.label": "Tiến độ của bạn",
            "journey.task.address": "Đăng ký địa chỉ nhà ở",
            "journey.task.insurance": "Tham gia bảo hiểm y tế",
            "journey.task.ic-card": "Làm thẻ IC để đi tàu điện và xe buýt",
            "journey.task.mobile": "Mua SIM và thiết lập dịch vụ di động",
            "journey.task.bank": "Mở tài khoản ngân hàng",
            "journey.task.job": "Tìm việc làm bán thời gian",
            "journey.form.situation": "Hoàn cảnh của bạn",
            "journey.form.submit": "Xem kế hoạch của tôi →",
            "journey.opt.student": "Du học tại Nhật Bản",
            "journey.opt.new": "Mới đến",
            "journey.opt.work": "Bắt đầu đi làm",
            "journey.opt.moving": "Chuyển nhà",
            "journey.opt.senmon": "Tìm trường nghề",
            "journey.opt.university": "Tìm trường đại học",
            "stages.title": "Bạn đang ở đâu trong hành trình Nhật Bản?",
            "stages.arrived.title": "Mới đến",
            "stages.arrived.desc": "Bắt đầu với các thủ tục cần thiết cho những tuần đầu tiên tại Nhật Bản.",
            "stages.arrived.link": "Bắt đầu tại đây →",
            "stages.student.title": "Du học tại Nhật Bản",
            "stages.student.desc": "Trường học, việc làm bán thời gian, tiền bạc và đời sống sinh viên.",
            "stages.student.link": "Hướng dẫn sinh viên →",
            "stages.work.title": "Bắt đầu đi làm",
            "stages.work.desc": "Giấy tờ đi làm, lương và kiến thức cơ bản nơi làm việc.",
            "stages.work.link": "Hướng dẫn đi làm →",
            "stages.moving.title": "Chuyển nhà",
            "stages.moving.desc": "Đổi địa chỉ, tiện ích và thủ tục chuyển nhà.",
            "stages.moving.link": "Hướng dẫn chuyển nhà →",
            "phrases.title": "Không biết nói gì bằng tiếng Nhật?",
            "phrases.desc": "Tìm các mẫu câu hữu ích cho tình huống thực tế và đưa ra trực tiếp khi bạn cần giúp đỡ.",
            "phrases.tab.hospital": "Bệnh viện",
            "phrases.tab.cityhall": "Tòa thị chính",
            "phrases.tab.work": "Công việc",
            "phrases.tab.train": "Tàu điện",
            "phrases.tab.shopping": "Mua sắm",
            "emg.title": "Cần giúp ngay bây giờ?",
            "emg.desc": "Nhận thông tin nhanh cho các trường hợp khẩn cấp.",
            "emg.police": "Cảnh sát",
            "emg.ambulance": "Cấp cứu / Cứu hỏa",
            "emg.medical": "Tư vấn y tế #7119",
            "emg.phone": "Mất điện thoại",
            "emg.bankcard": "Mất thẻ ngân hàng",
            "emg.residence": "Mất thẻ cư trú",
            "emg.open": "Mở hướng dẫn khẩn cấp",
            "faq.title": "Những câu hỏi thường gặp",
            "faq.desc": "Tìm câu trả lời cho các câu hỏi thường gặp về cuộc sống tại Nhật Bản.",
            "faq.viewall": "Xem tất cả câu hỏi →"
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
            "topic.emergency.sub": "တစ်ခုခု မှားယွင်းနေရင် ဘာလုပ်ရမလဲ",
            "journey.title": "သင့်ဂျပန်ခရီးစဉ်၊ တစ်ဆင့်ချင်းစီ။",
            "journey.desc": "သင့်အခြေအနေကို ပြောပြပြီး နောက်လုပ်ရမယ့် အဆင့်တွေအတွက် အကြံပြုထားတဲ့ စစ်ဆေးစာရင်းကို ကြည့်ပါ။",
            "journey.nav.mine": "ကျွန်ုပ်၏ ခရီးစဉ်",
            "journey.nav.saved": "သိမ်းထားသော လမ်းညွှန်များ",
            "journey.nav.phrases": "သိမ်းထားသော စကားစုများ",
            "journey.nav.dates": "အရေးကြီးသော ရက်စွဲများ",
            "journey.nav.settings": "ဆက်တင်များ",
            "journey.card.title": "သင့်ခရီးစဉ်",
            "journey.card.note": "ပြီးစီးပြီးသော အလုပ်များကို အမှန်ခြစ်ပေးပါ။",
            "journey.progress.label": "သင့်တိုးတက်မှု",
            "journey.task.address": "သင့်အိမ်လိပ်စာ မှတ်ပုံတင်ပါ",
            "journey.task.insurance": "ကျန်းမာရေး အာမခံအစီအစဉ်တွင် ပါဝင်ပါ",
            "journey.task.ic-card": "ရထားနှင့် ဘတ်စ်ကားအတွက် IC ကတ်ရယူပါ",
            "journey.task.mobile": "SIM ကတ်ရယူပြီး မိုဘိုင်းဝန်ဆောင်မှု စတင်ပါ",
            "journey.task.bank": "ဘဏ်အကောင့်ဖွင့်ပါ",
            "journey.task.job": "အချိန်ပိုင်း အလုပ်ရှာပါ",
            "journey.form.situation": "သင့်အခြေအနေ",
            "journey.form.submit": "ကျွန်ုပ်၏ အစီအစဉ် ကြည့်မယ် →",
            "journey.opt.student": "ဂျပန်မှာ ကျောင်းတက်နေသည်",
            "journey.opt.new": "အခုမှ ရောက်လာသည်",
            "journey.opt.work": "အလုပ်စလုပ်မည်",
            "journey.opt.moving": "အိမ်ပြောင်းမည်",
            "journey.opt.senmon": "အသက်မွေးဝမ်းကျောင်းရှာရန်",
            "journey.opt.university": "တက္ကသိုလ်ရှာရန်",
            "stages.title": "သင့်ဂျပန်ခရီးစဉ်မှာ ဘယ်အဆင့်ရောက်နေလဲ?",
            "stages.arrived.title": "အခုမှ ရောက်လာသည်",
            "stages.arrived.desc": "ဂျပန်မှာ ပထမရက်သတ္တပတ်တွေအတွက် မရှိမဖြစ်လုပ်ထုံးတွေက စတင်ပါ။",
            "stages.arrived.link": "ဒီနေရာက စတင်ပါ →",
            "stages.student.title": "ဂျပန်မှာ ကျောင်းတက်နေသည်",
            "stages.student.desc": "ကျောင်း၊ အချိန်ပိုင်းအလုပ်၊ ငွေကြေးနှင့် ကျောင်းသားဘဝ။",
            "stages.student.link": "ကျောင်းသား လမ်းညွှန် →",
            "stages.work.title": "အလုပ်စလုပ်မည်",
            "stages.work.desc": "အလုပ်စာရွက်စာတမ်း၊ လစာနှင့် လုပ်ငန်းခွင်အခြေခံများ။",
            "stages.work.link": "အလုပ် လမ်းညွှန် →",
            "stages.moving.title": "အိမ်ပြောင်းမည်",
            "stages.moving.desc": "လိပ်စာပြောင်းခြင်း၊ အသုံးအဆောင်များနှင့် အိမ်ပြောင်းလုပ်ထုံးများ။",
            "stages.moving.link": "အိမ်ပြောင်းခြင်း လမ်းညွှန် →",
            "phrases.title": "ဂျပန်လိုဘာပြောရမလဲ မသိဘူးလား?",
            "phrases.desc": "တကယ့်အခြေအနေတွေအတွက် အသုံးဝင်သော စကားစုများကို ရှာပြီး လိုအပ်တဲ့အခါ တိုက်ရိုက်ပြသပါ။",
            "phrases.tab.hospital": "ဆေးရုံ",
            "phrases.tab.cityhall": "မြို့တော်ခန်းမ",
            "phrases.tab.work": "အလုပ်",
            "phrases.tab.train": "ရထား",
            "phrases.tab.shopping": "ဈေးဝယ်ခြင်း",
            "emg.title": "အခုချက်ချင်း အကူအညီလိုသလား?",
            "emg.desc": "အရေးပေါ်အခြေအနေတွေအတွက် အမြန်သတင်းအချက်အလက်ရယူပါ။",
            "emg.police": "ရဲ",
            "emg.ambulance": "လူနာတင်ယာဉ် / မီးသတ်",
            "emg.medical": "ဆေးဘက်ဆိုင်ရာ အကြံဉာဏ် #7119",
            "emg.phone": "ဖုန်းပျောက်ဆုံးခြင်း",
            "emg.bankcard": "ဘဏ်ကတ်ပျောက်ဆုံးခြင်း",
            "emg.residence": "နေထိုင်ခွင့်ကတ်ပျောက်ဆုံးခြင်း",
            "emg.open": "အရေးပေါ် လမ်းညွှန်ဖွင့်မယ်",
            "faq.title": "လူတွေမကြာခဏမေးသော မေးခွန်းများ",
            "faq.desc": "ဂျပန်မှာနေထိုင်ခြင်းဆိုင်ရာ အမေးများသော မေးခွန်းတွေရဲ့ အဖြေတွေကို ရှာပါ။",
            "faq.viewall": "မေးခွန်းအားလုံး ကြည့်မယ် →"
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
