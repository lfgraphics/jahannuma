// Centralized multilingual texts following the Navbar pages array pattern
// Types
export type Language = "EN" | "UR" | "HI";

export interface TranslatedText {
  EN: string;
  UR: string;
  HI: string;
}

export type UISection = "buttons" | "messages" | "placeholders" | "confirmations";

// Main navigation entries (mirrors Navbar pages pattern)
export const navPages: Array<TranslatedText & { EN: string }> = [
  { EN: "Shaer", UR: "شعراء", HI: "शेयर" },
  { EN: "Ashaar", UR: "اشعار", HI: "अशार" },
  { EN: "Rubai", UR: "رباعی", HI: "रुबाई" },
  { EN: "Ghazlen", UR: "غزلیں", HI: "ग़ज़लें" },
  { EN: "Nazmen", UR: "نظمیں", HI: "नज़्में" },
  { EN: "E-Books", UR: "ای-بکس", HI: "ई-बुक्स" },
  { EN: "Blogs", UR: "بلاگز", HI: "ब्लॉग्स" },
  { EN: "Interview", UR: "انٹرویوز", HI: "इंटरव्यूज़" },
  { EN: "Faviorites", UR: "پسندیدہ", HI: "पसंदीदा" },
];

// UI Text Collections
export const uiTexts = {
  buttons: {
    save: { EN: "Save", UR: "محفوظ کریں", HI: "सेव करें" },
    cancel: { EN: "Cancel", UR: "منسوخ", HI: "रद्द करें" },
    delete: { EN: "Delete", UR: "حذف کریں", HI: "हटाएं" },
    share: { EN: "Share", UR: "شیئر کریں", HI: "साझा करें" },
    download: { EN: "Download", UR: "ڈاؤن لوڈ", HI: "डाउनलोड" },
    like: { EN: "Like", UR: "پسند", HI: "पसंद" },
    comment: { EN: "Comment", UR: "تبصرہ", HI: "टिप्पणी" },
    loadMore: { EN: "Load More", UR: "مزید لوڈ کریں", HI: "और लोड करें" },
    confirm: { EN: "Confirm", UR: "تصدیق کریں", HI: "पुष्टि करें" },
  },
  messages: {
    loading: { EN: "Loading...", UR: "لوڈ ہو رہا ہے...", HI: "लोड हो रहा है..." },
    error: { EN: "Something went wrong", UR: "کچھ غلط ہوا", HI: "कुछ गलत हुआ" },
    success: { EN: "Success!", UR: "کامیاب!", HI: "सफल!" },
    noData: { EN: "No data found", UR: "کوئی ڈیٹا نہیں ملا", HI: "कोई डेटा नहीं मिला" },
    copied: { EN: "Copied to clipboard", UR: "کاپی ہو گیا", HI: "क्लिपबोर्ड में कॉपी किया" },
  },
  placeholders: {
    search: { EN: "Search...", UR: "تلاش کریں...", HI: "खोजें..." },
    comment: { EN: "Write a comment...", UR: "تبصرہ لکھیں...", HI: "टिप्पणी लिखें..." },
  },
  confirmations: {
    delete: {
      EN: "Are you sure you want to delete this?",
      UR: "کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟",
      HI: "क्या आप वाकई इसे हटाना चाहते हैं?",
    },
    logout: {
      EN: "Are you sure you want to logout?",
      UR: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
      HI: "क्या आप वाकई लॉगआउट करना चाहते हैं?",
    },
  },
} as const;

// Helper functions
export function getText(section: UISection, key: string, language: Language): string | undefined {
  const sec = (uiTexts as any)[section];
  const item = sec?.[key];
  return item ? (item as TranslatedText)[language] : undefined;
}

export function getButtonText(action: keyof typeof uiTexts.buttons, language: Language): string {
  return uiTexts.buttons[action][language];
}

export function getMessageText(type: keyof typeof uiTexts.messages, language: Language): string {
  return uiTexts.messages[type][language];
}

export function isLangRTL(language: Language): boolean {
  return language === "UR"; // Urdu is RTL; EN and HI are LTR here
}
