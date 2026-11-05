import { Language } from "./multilingual-texts";

export interface TourStepInfo {
  title: string;
  description: string;
}

export interface TourContentData {
  nextBtn: string;
  prevBtn: string;
  doneBtn: string;
  skipBtn: string;
  progressText: string;
  restartTourLabel: string;
  steps: {
    hamburger: TourStepInfo;
    mobileNav: TourStepInfo;
    language: TourStepInfo;
    theme: TourStepInfo;
    login: TourStepInfo;
    donate: TourStepInfo;
    search: TourStepInfo;
    cardActions: TourStepInfo;
    quiz: TourStepInfo;
    contact: TourStepInfo;
    social: TourStepInfo;
    quickLinks: TourStepInfo;
  };
}

export const tourContent: Record<Language, TourContentData> = {
  EN: {
    nextBtn: "Next →",
    prevBtn: "← Back",
    doneBtn: "Finish Tour",
    skipBtn: "Skip Tour",
    progressText: "{{current}} of {{total}}",
    restartTourLabel: "Website Tour",
    steps: {
      hamburger: {
        title: "Navigation Menu",
        description:
          "Open the mobile menu to explore Poets (Shaer), Couplets (Ashaar), Ghazals, Nazms, E-Books, and more.",
      },
      mobileNav: {
        title: "Category Bar (Swipe to Scroll)",
        description:
          "Swipe or scroll horizontally across this bar to easily explore all categories: Poets (Shaer), Couplets (Ashaar), Rubai, Ghazals, Nazms, E-Books, Blogs, and more.",
      },
      language: {
        title: "Language Switcher",
        description:
          "Switch the entire website seamlessly between Urdu (اردو), Hindi (हिन्दी), and English at any time.",
      },
      theme: {
        title: "Theme Toggle",
        description:
          "Switch between Light and Dark mode for an optimal reading experience day or night.",
      },
      login: {
        title: "User Profile & Sign In",
        description:
          "Sign in to sync likes, save favorite poetry, join comments, and download high-resolution poetry cards.",
      },
      donate: {
        title: "Support Jahannuma",
        description:
          "Help keep Urdu literature accessible to all by contributing to our non-profit digital initiative.",
      },
      search: {
        title: "Universal Search",
        description:
          "Search across our entire treasury of poets, couplets, ghazals, nazms, and thematic tags.",
      },
      cardActions: {
        title: "Interact: Like, Comment, Share & Download",
        description:
          "Engage with couplets: ❤️ Like to add to favorites, 💬 join the literary discussion, ↗️ share with friends, and 📥 download as a formatted image card.",
      },
      quiz: {
        title: "Daily Urdu Quiz",
        description:
          "Test your knowledge of Urdu language, poetry, and history with fresh questions updated daily!",
      },
      contact: {
        title: "Contact Form",
        description:
          "Have questions, suggestions, or feedback? Reach out directly to the Jahannuma team.",
      },
      social: {
        title: "Follow Us",
        description:
          "Stay connected with us across Facebook, Instagram, X (Twitter), and YouTube for daily verses and literary updates.",
      },
      quickLinks: {
        title: "Quick Links",
        description:
          "Browse founders info, privacy policies, or restart this interactive tour at any time.",
      },
    },
  },
  UR: {
    nextBtn: "آگے ←",
    prevBtn: "→ پیچھے",
    doneBtn: "دورہ مکمل",
    skipBtn: "چھوڑیں",
    progressText: "{{current}} از {{total}}",
    restartTourLabel: "ویب سائٹ کا دورہ",
    steps: {
      hamburger: {
        title: "نیویگیشن مینو",
        description:
          "موبائل مینو کھول کر شعراء، اشعار، غزلیں، نظمیں، ای-بکس اور دیگر ادبی گوشے دریافت کریں۔",
      },
      mobileNav: {
        title: "اصناف و ابواب (اسکرول ایبل بار)",
        description:
          "تمام اصناف جیسے شعراء، اشعار، رباعی، غزلیں، نظمیں، ای-بکس اور بلاگز تک فوری رسائی کے لیے اس پٹی کو دائیں بائیں اسکرول (سوائپ) کریں۔",
      },
      language: {
        title: "زبان کا انتخاب",
        description:
          "پوری ویب سائٹ کے لیے اپنی پسندیدہ زبان (اردو، ہندی یا انگریزی) کا باآسانی انتخاب کریں۔",
      },
      theme: {
        title: "تھیم تبدیل کریں",
        description:
          "مطالعے کی سہولت کے لیے ڈارک یا لائٹ موڈ کا انتخاب کریں۔",
      },
      login: {
        title: "اکاؤنٹ اور لاگ ان",
        description:
          "اشعار کو پسندیدہ میں محفوظ کرنے، تبصرے لکھنے اور اشعار ڈاؤن لوڈ کرنے کے لیے لاگ ان کریں۔",
      },
      donate: {
        title: "ہمیں عطیہ کریں",
        description:
          "اردو زبان و ادب کے فروغ اور اس مفت پلیٹ فارم کو جاری رکھنے کے لیے ہمارا تعاون فرمائیں۔",
      },
      search: {
        title: "تلاش کریں",
        description:
          "کسی بھی شاعر، شعر، غزل، نظم یا لفظ کو پورے ذخیرے میں فوری تلاش کریں۔",
      },
      cardActions: {
        title: "شعر پر تعامل: پسند، تبصرہ، شیئر اور ڈاؤن لوڈ",
        description:
          "ہر شعر پر دستیاب سہولیات: ❤️ پسند (لائیک) کریں، 💬 اپنی رائے یا تبصرہ لکھیں، ↗️ احباب سے شیئر کریں، اور 📥 خوبصورت تصویری کارڈ ڈاؤن لوڈ کریں۔",
      },
      quiz: {
        title: "روزانہ جہاں نما کوئز",
        description:
          "اردو ادب اور شاعری سے متعلق روزانہ ایک نیا سوال حل کریں اور اپنی ادبی معلومات آزمائیں!",
      },
      contact: {
        title: "ہم سے رابطہ کریں",
        description:
          "کوئی مشورہ، سوال یا کلام بھیجنا چاہیں تو اس فارم کے ذریعے براہِ راست ہم سے رابطہ کریں۔",
      },
      social: {
        title: "سوشل میڈیا پر جڑیں",
        description:
          "روزانہ نئے اشعار اور تازہ اپڈیٹس کے لیے فیس بک، انسٹاگرام، ایکس اور یوٹیوب پر ہمارے ساتھ جڑیں۔",
      },
      quickLinks: {
        title: "فوری روابط",
        description:
          "بانی و سرپرست، پالیسی ملاحظہ کریں، یا کسی بھی وقت دوبارہ ویب سائٹ کا یہ دورہ شروع کریں!",
      },
    },
  },
  HI: {
    nextBtn: "आगे →",
    prevBtn: "← पीछे",
    doneBtn: "समाप्त करें",
    skipBtn: "टूर छोड़ें",
    progressText: "{{current}} / {{total}}",
    restartTourLabel: "वेबसाइट टूर",
    steps: {
      hamburger: {
        title: "नेविगेशन मेनू",
        description:
          "शायर, अशआर, ग़ज़लें, नज़्में और ई-बुक्स देखने के लिए मोबाइल मेनू खोलें।",
      },
      mobileNav: {
        title: "श्रेणी पट्टी (स्क्रॉल करें)",
        description:
          "शायर, अशआर, रुबाई, ग़ज़लें, नज़्में, ई-बुक्स और ब्लॉग्स तक पहुँचने के लिए इस पट्टी को बाएँ-दाएँ स्वाइप/स्क्रॉल करें।",
      },
      language: {
        title: "भाषा चुनें",
        description:
          "पूरी वेबसाइट को अपनी सुविधानुसार उर्दू, हिंदी या अंग्रेजी भाषा में बदलें।",
      },
      theme: {
        title: "थीम बदलें",
        description:
          "दिन या रात में सहज पठन के लिए लाइट या डार्क मोड चुनें।",
      },
      login: {
        title: "लॉगिन और प्रोफ़ाइल",
        description:
          "पसंदीदा अशआर सेव करने, टिप्पणी करने और डाउनलोड करने के लिए साइन इन करें।",
      },
      donate: {
        title: "सहयोग और दान",
        description:
          "उर्दू भाषा और साहित्य के प्रचार-प्रसार में हमारे डिजिटल प्रयास का समर्थन करें।",
      },
      search: {
        title: "खोजें (सर्च)",
        description:
          "किसी भी शायर, शेर, ग़ज़ल, नज़्म या विषय को तुरंत खोजें।",
      },
      cardActions: {
        title: "शेर पर प्रतिक्रिया: पसंद, टिप्पणी, साझा और डाउनलोड",
        description:
          "शेर के साथ सीधे जुड़ें: ❤️ पसंद (लाइक) करें, 💬 टिप्पणी करें, ↗️ दोस्तों के साथ साझा करें, और 📥 सुंदर छवि कार्ड के रूप में डाउनलोड करें।",
      },
      quiz: {
        title: "दैनिक जहांनुमा क्विज़",
        description:
          "उर्दू शायरी और साहित्य से जुड़े नए सवाल का रोज़ाना जवाब दें और अपना ज्ञान परखें!",
      },
      contact: {
        title: "संपर्क करें",
        description:
          "सुझाव, सवाल या अपनी रचनाएँ भेजने के लिए इस फॉर्म के जरिए संपर्क करें।",
      },
      social: {
        title: "सोशल मीडिया पर जुड़ें",
        description:
          "रोज़ाना नए अशआर और अपडेट्स के लिए फेसबुक, इंस्टाग्राम, एक्स और यूट्यूब पर फॉलो करें।",
      },
      quickLinks: {
        title: "त्वरित लिंक",
        description:
          "संस्थापकों की जानकारी, नीतियां देखें या किसी भी समय इस वेबसाइट टूर को पुनः शुरू करें!",
      },
    },
  },
};
