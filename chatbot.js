/* LifeBridge Japan offline chatbot.
 * Rule-based answers from the saved guides. No network needed.
 * Loaded on every page by i18n.js (deferred, cached by the service worker).
 * The knowledge base below is JSON-compatible (double quotes only) so the
 * Python test suite can parse and validate it. Keep it that way.
 */
(function () {
    "use strict";
    if (window.LBChat && window.LBChat.ready) return;

    var LB_CHAT_KB = [
        {
            "id": "greeting",
            "links": [],
            "keys": {
                "en": ["hello", "hey", "good morning", "good afternoon", "good evening", "namaste"],
                "ne": ["नमस्ते", "नमस्कार", "हेलो"],
                "vi": ["xin chao", "xin chào", "chào bạn", "hello"],
                "my": ["မင်္ဂလာပါ", "ဟယ်လို"],
                "ja": ["こんにちは"]
            },
            "answers": {
                "en": "Hello! Ask me about address, bank, jobs, health, transport, or emergencies. I answer from the saved guides, even offline.",
                "ne": "नमस्ते! ठेगाना, बैंक, काम, स्वास्थ्य, यातायात वा आपतकालबारे सोध्नुहोस्। सेभ गरिएका गाइडबाट जवाफ दिन्छु, अफलाइन पनि।",
                "vi": "Xin chào! Hãy hỏi về địa chỉ, ngân hàng, việc làm, sức khỏe, giao thông hoặc khẩn cấp. Tôi trả lời từ hướng dẫn đã lưu, kể cả khi ngoại tuyến.",
                "my": "မင်္ဂလာပါ! လိပ်စာ၊ ဘဏ်၊ အလုပ်၊ ကျန်းမာရေး၊ သယ်ယူပို့ဆောင်ရေး သို့မဟုတ် အရေးပေါ်အကြောင်း မေးပါ။ သိမ်းထားသော လမ်းညွှန်များမှ ဖြေပေးပါတယ်၊ အော့ဖ်လိုင်းလည်း ရပါတယ်။"
            }
        },
        {
            "id": "lostcard",
            "links": ["emergency.html"],
            "keys": {
                "en": ["lost", "lose", "missing card", "stolen"],
                "ne": ["हरायो", "हराएको", "चोरी"],
                "vi": ["mất", "đánh mất"],
                "my": ["ပျောက်", "ပျောက်ဆုံး"],
                "ja": ["紛失", "なくし"]
            },
            "answers": {
                "en": "For a lost residence card, report to the police first, then visit the immigration office to reissue it. Carry the police report.",
                "ne": "निवास कार्ड हराए पहिले प्रहरीमा रिपोर्ट गर्नुहोस्, अनि अध्यागमन कार्यालयमा गएर पुनः बनाउनुहोस्। प्रहरी रिपोर्ट साथ लैजानुहोस्।",
                "vi": "Nếu mất thẻ cư trú, hãy báo cảnh sát trước, sau đó đến cục xuất nhập cảnh để làm lại. Mang theo biên bản báo mất.",
                "my": "နေထိုင်ခွင့်ကတ် ပျောက်ပါက အရင် ရဲစခန်းတွင် တိုင်ကြားပြီး လူဝင်မှုရုံးတွင် ပြန်လျှောက်ပါ။ ရဲတိုင်စာ ယူသွားပါ။"
            }
        },
        {
            "id": "emergency",
            "links": ["emergency.html"],
            "keys": {
                "en": ["emergency", "police", "fire", "ambulance", "110", "119", "7119", "accident"],
                "ne": ["आपतकाल", "प्रहरी", "पुलिस", "दमकल", "एम्बुलेन्स", "११०", "११९", "दुर्घटना"],
                "vi": ["khẩn cấp", "khan cap", "cảnh sát", "cứu hỏa", "cấp cứu"],
                "my": ["အရေးပေါ်", "ရဲ", "မီးသတ်", "လူနာတင်"],
                "ja": ["緊急", "警察", "救急"]
            },
            "answers": {
                "en": "Police: 110. Ambulance or fire: 119. Medical advice: #7119. Details are in the Emergency guide.",
                "ne": "प्रहरी: ११०। एम्बुलेन्स वा दमकल: ११९। चिकित्सा सल्लाह: #7119। विवरण Emergency गाइडमा छ।",
                "vi": "Cảnh sát: 110. Cấp cứu hoặc cứu hỏa: 119. Tư vấn y tế: #7119. Chi tiết trong hướng dẫn Emergency.",
                "my": "ရဲ - ၁၁၀။ လူနာတင် သို့မဟုတ် မီးသတ် - ၁၁၉။ ဆေးဘက်ဆိုင်ရာ အကြံဉာဏ် - #7119။ အသေးစိတ်ကို Emergency လမ်းညွှန်တွင် ကြည့်ပါ။"
            }
        },
        {
            "id": "address",
            "links": ["documents.html"],
            "keys": {
                "en": ["address", "register", "registration", "move in", "moving in", "moving-in", "tennyu", "ward office", "city office", "residence card"],
                "ne": ["ठेगाना", "दर्ता", "सर्ने", "वार्ड"],
                "vi": ["địa chỉ", "dia chi", "đăng ký", "dang ky", "chuyển đến", "chuyển nhà"],
                "my": ["လိပ်စာ", "မှတ်ပုံ", "ပြောင်းရွှေ့"],
                "ja": ["住所", "転入"]
            },
            "answers": {
                "en": "Register your address at the city or ward office within 14 days of moving in. Bring your residence card and passport.",
                "ne": "सरेको १४ दिनभित्र सिटी वा वार्ड कार्यालयमा ठेगाना दर्ता गर्नुहोस्। निवास कार्ड र राहदानी लैजानुहोस्।",
                "vi": "Đăng ký địa chỉ tại văn phòng thành phố hoặc quận trong 14 ngày sau khi chuyển đến. Mang thẻ cư trú và hộ chiếu.",
                "my": "ပြောင်းရွှေ့ပြီး ၁၄ ရက်အတွင်း မြို့ သို့မဟုတ် ရပ်ကွက်ရုံးတွင် လိပ်စာ မှတ်ပုံတင်ပါ။ နေထိုင်ခွင့်ကတ်နှင့် နိုင်ငံကူးလက်မှတ် ယူသွားပါ။"
            }
        },
        {
            "id": "bank",
            "links": ["money.html"],
            "keys": {
                "en": ["bank", "account", "open account", "salary", "remittance"],
                "ne": ["बैंक", "खाता", "तलब"],
                "vi": ["ngân hàng", "ngan hang", "tài khoản", "tai khoan", "lương"],
                "my": ["ဘဏ်", "အကောင့်", "လစာ"],
                "ja": ["銀行", "口座"]
            },
            "answers": {
                "en": "Choose a bank and open an account with your residence card and address proof. Ask about fees and language support.",
                "ne": "बैंक छान्नुहोस् र निवास कार्ड र ठेगाना प्रमाणसहित खाता खोल्नुहोस्। शुल्क र भाषा सहयोगबारे सोध्नुहोस्।",
                "vi": "Chọn ngân hàng và mở tài khoản bằng thẻ cư trú và giấy tờ địa chỉ. Hỏi về phí và hỗ trợ ngôn ngữ.",
                "my": "ဘဏ်ရွေးပြီး နေထိုင်ခွင့်ကတ်နှင့် လိပ်စာအထောက်အထားဖြင့် အကောင့်ဖွင့်ပါ။ အခကြေးငွေနှင့် ဘာသာစကား အကူအညီအကြောင်း မေးပါ။"
            }
        },
        {
            "id": "work",
            "links": ["jobs.html"],
            "keys": {
                "en": ["job", "work", "part-time", "part time", "baito", "arubaito", "28 hours", "permission", "interview", "resume"],
                "ne": ["काम", "जागिर", "बैतो", "पार्ट", "अनुमति", "२८"],
                "vi": ["việc", "viec", "làm thêm", "lam them", "giấy phép", "giay phep", "28 giờ", "phỏng vấn"],
                "my": ["အလုပ်", "အချိန်ပိုင်း", "ခွင့်ပြုချက်", "၂၈"],
                "ja": ["仕事", "アルバイト", "許可"]
            },
            "answers": {
                "en": "Students need work permission before starting. During school terms the limit is 28 hours a week. Check with your school.",
                "ne": "विद्यार्थीले काम सुरु गर्नुअघि अनुमति चाहिन्छ। पढाइ चल्दा हप्तामा २८ घण्टाको सीमा छ। विद्यालयसँग बुझ्नुहोस्।",
                "vi": "Du học sinh cần giấy phép trước khi làm việc. Trong học kỳ, giới hạn là 28 giờ mỗi tuần. Hãy hỏi trường của bạn.",
                "my": "ကျောင်းသားများ အလုပ်မစမီ ခွင့်ပြုချက် လိုပါတယ်။ ကျောင်းဖွင့်ချိန်တွင် တစ်ပတ် ၂၈ နာရီ ကန့်သတ်ထားပါတယ်။ ကျောင်းနှင့် မေးပါ။"
            }
        },
        {
            "id": "health",
            "links": ["health.html"],
            "keys": {
                "en": ["insurance", "health", "hospital", "doctor", "sick", "clinic", "medicine"],
                "ne": ["बीमा", "स्वास्थ्य", "अस्पताल", "डाक्टर", "बिरामी"],
                "vi": ["bảo hiểm", "bao hiem", "sức khỏe", "suc khoe", "bệnh viện", "benh vien", "bác sĩ", "bac si", "ốm"],
                "my": ["အာမခံ", "ကျန်းမာရေး", "ဆေးရုံ", "ဆရာဝန်"],
                "ja": ["保険", "病院", "病気"]
            },
            "answers": {
                "en": "Join a health insurance plan through your city office, school, or employer. Find a nearby clinic and ask what to bring.",
                "ne": "सिटी कार्यालय, विद्यालय वा रोजगारदातामार्फत स्वास्थ्य बीमामा जोडिनुहोस्। नजिकको क्लिनिक खोजेर के ल्याउने सोध्नुहोस्।",
                "vi": "Tham gia bảo hiểm y tế qua văn phòng thành phố, trường học hoặc công ty. Tìm phòng khám gần nhất và hỏi cần mang gì.",
                "my": "မြို့ရုံး၊ ကျောင်း သို့မဟုတ် အလုပ်ရှင်မှတစ်ဆင့် ကျန်းမာရေးအာမခံတွင် ပါဝင်ပါ။ အနီးဆေးခန်း ရှာပြီး ဘာယူရမလဲ မေးပါ။"
            }
        },
        {
            "id": "transport",
            "links": ["transport.html"],
            "keys": {
                "en": ["ic card", "suica", "pasmo", "train", "bus", "station", "commute"],
                "ne": ["आईसी", "रेल", "बस", "स्टेसन"],
                "vi": ["thẻ ic", "the ic", "tàu", "tau", "xe buýt", "xe buyt", "ga"],
                "my": ["ic ကတ်", "ရထား", "ဘတ်စ်ကား", "ဘူတာ"],
                "ja": ["電車", "バス"]
            },
            "answers": {
                "en": "Get an IC card (Suica or Pasmo) at any station ticket machine. Tap it on trains and buses.",
                "ne": "कुनै पनि स्टेसनको टिकट मेसिनबाट आईसी कार्ड (Suica वा Pasmo) लिनुहोस्। रेल र बसमा ट्याप गर्नुहोस्।",
                "vi": "Mua thẻ IC (Suica hoặc Pasmo) tại máy bán vé ở ga. Quẹt thẻ khi đi tàu và xe buýt.",
                "my": "ဘူတာလက်မှတ်စက်တိုင်းတွင် IC ကတ် (Suica သို့မဟုတ် Pasmo) ဝယ်ပါ။ ရထားနှင့် ဘတ်စ်ကားတွင် တို့သုံးပါ။"
            }
        },
        {
            "id": "sim",
            "links": [],
            "keys": {
                "en": ["sim", "mobile", "phone", "smartphone"],
                "ne": ["सिम", "मोबाइल", "फोन"],
                "vi": ["sim", "điện thoại", "dien thoai"],
                "my": ["ဆင်းမ်", "ဖုန်း"],
                "ja": ["携帯"]
            },
            "answers": {
                "en": "You can get a SIM card at mobile shops and electronics stores. Bring your residence card and ask about monthly plans.",
                "ne": "मोबाइल पसल र इलेक्ट्रोनिक्स पसलबाट सिम कार्ड लिन सक्नुहुन्छ। निवास कार्ड लैजानुहोस् र मासिक योजनाबारे सोध्नुहोस्।",
                "vi": "Bạn có thể mua SIM tại cửa hàng di động và điện máy. Mang thẻ cư trú và hỏi về gói cước hàng tháng.",
                "my": "မိုဘိုင်းဆိုင်နှင့် လျှပ်စစ်ပစ္စည်းဆိုင်များတွင် ဆင်းမ်ကတ် ဝယ်နိုင်ပါတယ်။ နေထိုင်ခွင့်ကတ် ယူသွားပြီး လစဉ်ပက်ကေ့ချ်အကြောင်း မေးပါ။"
            }
        },
        {
            "id": "japanese",
            "links": ["japanese.html"],
            "keys": {
                "en": ["japanese", "phrase", "speak", "talk", "say", "language"],
                "ne": ["जापानी", "वाक्य", "बोल्ने", "भाषा"],
                "vi": ["tiếng nhật", "tieng nhat", "mẫu câu", "mau cau", "nói"],
                "my": ["ဂျပန်", "စကားစု", "ပြော"],
                "ja": ["日本語"]
            },
            "answers": {
                "en": "Use the Japanese phrase helper: pick a situation, listen, copy, or save the phrase for later.",
                "ne": "जापानी वाक्य सहयोग प्रयोग गर्नुहोस्: अवस्था छान्नुहोस्, सुन्नुहोस्, कपी वा सेभ गर्नुहोस्।",
                "vi": "Hãy dùng công cụ mẫu câu tiếng Nhật: chọn tình huống, nghe, sao chép hoặc lưu mẫu câu.",
                "my": "ဂျပန်စကားစု အကူအညီ သုံးပါ - အခြေအနေ ရွေးပြီး နားထောင်၊ ကူး သို့မဟုတ် သိမ်းထားပါ။"
            }
        },
        {
            "id": "thanks",
            "links": [],
            "keys": {
                "en": ["thank", "thanks", "great", "good"],
                "ne": ["धन्यवाद", "राम्रो"],
                "vi": ["cảm ơn", "cam on", "hay"],
                "my": ["ကျေးဇူး", "ကောင်း"],
                "ja": ["ありがとう"]
            },
            "answers": {
                "en": "You are welcome! Ask anytime.",
                "ne": "तपाईंलाई स्वागत छ! जुनसुकै बेला सोध्नुहोस्।",
                "vi": "Không có gì! Hãy hỏi bất cứ lúc nào.",
                "my": "ရပါတယ်! အချိန်မရွေး မေးပါ။"
            }
        },
        {
            "id": "fallback",
            "links": [],
            "keys": {},
            "answers": {
                "en": "I answer from the saved guides. Try asking about address, bank, jobs, health, transport, or emergencies.",
                "ne": "म सेभ गरिएका गाइडबाट जवाफ दिन्छु। ठेगाना, बैंक, काम, स्वास्थ्य, यातायात वा आपतकालबारे सोध्नुहोस्।",
                "vi": "Tôi trả lời từ các hướng dẫn đã lưu. Hãy hỏi về địa chỉ, ngân hàng, việc làm, sức khỏe, giao thông hoặc khẩn cấp.",
                "my": "သိမ်းထားသော လမ်းညွှန်များမှ ဖြေပေးပါတယ်။ လိပ်စာ၊ ဘဏ်၊ အလုပ်၊ ကျန်းမာရေး၊ သယ်ယူပို့ဆောင်ရေး သို့မဟုတ် အရေးပေါ်အကြောင်း မေးပါ။"
            }
        }
    ];

    var LB_CHAT_SUGGEST = {
        "en": ["How do I register my address?", "How do I open a bank account?", "Can students work part-time?", "Emergency numbers?"],
        "ne": ["ठेगाना कसरी दर्ता गर्ने?", "बैंक खाता कसरी खोल्ने?", "विद्यार्थीले काम गर्न मिल्छ?", "आपतकालीन नम्बर?"],
        "vi": ["Đăng ký địa chỉ thế nào?", "Mở tài khoản ngân hàng thế nào?", "Du học sinh được làm thêm không?", "Số khẩn cấp?"],
        "my": ["လိပ်စာ ဘယ်လိုမှတ်ပုံတင်ရမလဲ။", "ဘဏ်အကောင့် ဘယ်လိုဖွင့်ရမလဲ။", "ကျောင်းသား အလုပ်လုပ်လို့ရလား။", "အရေးပေါ်ဖုန်းနံပါတ်။"]
    };

    function chatT(key, fallback) {
        try {
            if (window.LBT && typeof window.LBT.t === "function") {
                var value = window.LBT.t(key);
                if (typeof value === "string" && value !== "" && value !== key) return value;
            }
        } catch (e) { /* fall through */ }
        return fallback;
    }

    function chatLang() {
        try {
            if (window.LBT && typeof window.LBT.lang === "function") {
                var lang = window.LBT.lang();
                if (lang === "en" || lang === "ne" || lang === "vi" || lang === "my") return lang;
            }
            var htmlLang = document.documentElement.getAttribute("lang");
            if (htmlLang === "en" || htmlLang === "ne" || htmlLang === "vi" || htmlLang === "my") return htmlLang;
        } catch (e) { /* fall through */ }
        return "en";
    }

    function normalize(text) {
        var value = String(text || "");
        try {
            if (typeof value.normalize === "function") value = value.normalize("NFKC");
        } catch (e) { /* keep raw */ }
        return " " + value.toLowerCase().replace(/\s+/g, " ").trim() + " ";
    }

    function findBest(input) {
        var text = normalize(input);
        var best = null;
        var bestScore = 0;
        for (var i = 0; i < LB_CHAT_KB.length; i++) {
            var intent = LB_CHAT_KB[i];
            if (!intent || intent.id === "fallback") continue;
            var score = 0;
            var groups = intent.keys || {};
            for (var lang in groups) {
                if (!Object.prototype.hasOwnProperty.call(groups, lang)) continue;
                var words = groups[lang] || [];
                for (var w = 0; w < words.length; w++) {
                    var word = normalize(words[w]).replace(/^\s+|\s+$/g, "");
                    if (word && text.indexOf(word) !== -1) score++;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                best = intent;
            }
        }
        if (!best) {
            for (var j = 0; j < LB_CHAT_KB.length; j++) {
                if (LB_CHAT_KB[j] && LB_CHAT_KB[j].id === "fallback") return LB_CHAT_KB[j];
            }
        }
        return best;
    }

    function linkLabel(href) {
        var id = String(href || "").replace(/\.html$/, "");
        try {
            if (typeof guideData !== "undefined" && typeof guideTitle === "function") {
                for (var i = 0; i < guideData.length; i++) {
                    if (guideData[i] && guideData[i].id === id) return guideTitle(guideData[i]);
                }
            }
        } catch (e) { /* fall through */ }
        return id ? id.charAt(0).toUpperCase() + id.slice(1) : href;
    }

    function safeHref(href) {
        return /^([a-z-]+\.html)$/.test(String(href || "")) ? href : null;
    }

    var fab = null;
    var panel = null;
    var msgs = null;
    var chips = null;
    var form = null;
    var input = null;
    var sendBtn = null;
    var titleEl = null;
    var statusEl = null;
    var closeBtn = null;
    var backdrop = null;
    var greeted = false;

    function addMsg(text, who) {
        var div = document.createElement("div");
        div.className = who === "user" ? "chat-msg-user" : "chat-msg-bot";
        div.textContent = text;
        msgs.appendChild(div);
        var time = document.createElement("div");
        time.className = who === "user" ? "chat-time user" : "chat-time bot";
        try {
            time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch (e) { time.textContent = ""; }
        msgs.appendChild(time);
        msgs.scrollTop = msgs.scrollHeight;
    }

    function addLinks(links) {
        if (!links || !links.length) return;
        var row = document.createElement("div");
        row.className = "chat-links";
        for (var i = 0; i < links.length; i++) {
            var href = safeHref(links[i]);
            if (!href) continue;
            var a = document.createElement("a");
            a.className = "chat-link";
            a.href = href;
            a.textContent = linkLabel(href) + " →";
            row.appendChild(a);
        }
        if (row.childNodes.length) {
            msgs.appendChild(row);
            msgs.scrollTop = msgs.scrollHeight;
        }
    }

    function showSuggestions() {
        chips.replaceChildren();
        var list = LB_CHAT_SUGGEST[chatLang()] || LB_CHAT_SUGGEST.en;
        for (var i = 0; i < list.length; i++) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "chip";
            btn.textContent = list[i];
            btn.addEventListener("click", function () {
                sendText(this.textContent);
            });
            chips.appendChild(btn);
        }
    }

    function answer(inputText) {
        var intent = findBest(inputText);
        if (!intent) return;
        var lang = chatLang();
        var answers = intent.answers || {};
        addMsg(answers[lang] || answers.en || "", "bot");
        addLinks(intent.links);
    }

    function sendText(text) {
        text = String(text || "").trim();
        if (!text) return;
        addMsg(text, "user");
        answer(text);
        showSuggestions();
    }

    function refreshChrome() {
        fab.setAttribute("aria-label", chatT("chat.open", "Open chat"));
        titleEl.textContent = chatT("chat.title", "Ask LifeBridge");
        statusEl.textContent = chatT("chat.online", "Online");
        closeBtn.setAttribute("aria-label", chatT("chat.close", "Close chat"));
        var ph = chatT("chat.placeholder", "Type your question...");
        input.setAttribute("placeholder", ph);
        input.setAttribute("aria-label", ph);
        sendBtn.textContent = chatT("chat.send", "Send");
        showSuggestions();
    }

    function togglePanel(force) {
        var show = typeof force === "boolean" ? force : panel.hidden;
        panel.hidden = !show;
        backdrop.hidden = !show;
        try {
            if (show) document.documentElement.classList.add("chat-open");
            else document.documentElement.classList.remove("chat-open");
        } catch (e) { /* ignore */ }
        fab.setAttribute("aria-expanded", String(show));
        if (show && !greeted) {
            greeted = true;
            greet();
            showSuggestions();
        }
        if (show) {
            try { input.focus({ preventScroll: true }); } catch (e) { try { input.focus(); } catch (e2) { /* ignore */ } }
        }
    }

    function build() {
        fab = document.createElement("button");
        fab.type = "button";
        fab.className = "chat-fab";
        fab.setAttribute("aria-expanded", "false");
        fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';

        panel = document.createElement("div");
        panel.className = "chat-panel";
        panel.hidden = true;
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");

        backdrop = document.createElement("div");
        backdrop.className = "chat-backdrop";
        backdrop.hidden = true;

        var head = document.createElement("div");
        head.className = "chat-head";
        var avatar = document.createElement("span");
        avatar.className = "chat-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.textContent = "LB";
        var headText = document.createElement("span");
        headText.className = "chat-head-text";
        titleEl = document.createElement("strong");
        statusEl = document.createElement("span");
        statusEl.className = "chat-status";
        headText.append(titleEl, statusEl);
        closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "chat-close";
        closeBtn.textContent = "×";
        head.append(avatar, headText, closeBtn);

        msgs = document.createElement("div");
        msgs.className = "chat-msgs";
        msgs.setAttribute("role", "log");
        msgs.setAttribute("aria-live", "polite");

        chips = document.createElement("div");
        chips.className = "chat-chips";

        form = document.createElement("form");
        form.className = "chat-form";
        input = document.createElement("input");
        input.type = "text";
        input.autocomplete = "off";
        input.maxLength = 500;
        sendBtn = document.createElement("button");
        sendBtn.type = "submit";
        sendBtn.className = "btn btn-prim";
        form.append(input, sendBtn);

        panel.append(head, msgs, chips, form);
        document.body.append(fab, backdrop, panel);

        fab.addEventListener("click", function () { togglePanel(); });
        backdrop.addEventListener("click", function () { togglePanel(false); });
        closeBtn.addEventListener("click", function () {
            togglePanel(false);
            fab.focus();
        });
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            sendText(input.value);
            input.value = "";
        });
        document.addEventListener("keydown", function (event) {
            if (panel.hidden) return;
            if (event.key === "Escape") {
                togglePanel(false);
                fab.focus();
                return;
            }
            if (event.key !== "Tab") return;
            var focusables = panel.querySelectorAll("button, input, a[href]");
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
        document.addEventListener("lb:lang", refreshChrome);

        refreshChrome();
    }

    // First open shows the greeting intent from the KB.
    function greet() {
        var lang = chatLang();
        for (var i = 0; i < LB_CHAT_KB.length; i++) {
            if (LB_CHAT_KB[i] && LB_CHAT_KB[i].id === "greeting" && LB_CHAT_KB[i].answers) {
                var answers = LB_CHAT_KB[i].answers;
                addMsg(answers[lang] || answers.en || "", "bot");
                return;
            }
        }
    }

    function init() {
        build();
        window.LBChat = {
            ready: true,
            open: function () { togglePanel(true); },
            close: function () { togglePanel(false); }
        };
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
