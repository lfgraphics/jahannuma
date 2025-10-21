// Centralized multilingual texts following the Navbar pages array pattern
// Types
export type Language = "EN" | "UR" | "HI";

export interface TranslatedText {
  EN: string;
  UR: string;
  HI: string;
}

export type UISection = "buttons" | "messages" | "placeholders" | "confirmations" | "labels";

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
  { EN: "Favorites", UR: "پسندیدہ", HI: "पसंदीदा" },
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
    signIn: { EN: "Sign In", UR: "لاگ ان", HI: "साइन इन" },
    signUp: { EN: "Sign Up", UR: "رجسٹر", HI: "साइन अप" },
    signOut: { EN: "Sign Out", UR: "لاگ آؤٹ", HI: "साइन आउट" },
  },
  messages: {
    loading: { EN: "Loading...", UR: "لوڈ ہو رہا ہے...", HI: "लोड हो रहा है..." },
    error: { EN: "Something went wrong", UR: "کچھ غلط ہوا", HI: "कुछ गलत हुआ" },
    success: { EN: "Success!", UR: "کامیاب!", HI: "सफल!" },
    noData: { EN: "No data found", UR: "کوئی ڈیٹا نہیں ملا", HI: "कोई डेटा नहीं मिला" },
    copied: { EN: "Copied to clipboard", UR: "کاپی ہو گیا", HI: "क्लिपबोर्ड में कॉपी किया" },
    loginRequired: { EN: "Login Required", UR: "لاگ ان ضروری", HI: "लॉगिन आवश्यक" },
    loginToDownload: { EN: "Please login to download", UR: "برائے کرم ڈاؤن لوڈ کے لیے لاگ ان کریں", HI: "डाउनलोड के लिए कृपया लॉगिन करें" },
    loginToLike: { EN: "Please login to like", UR: "برائے کرم پسند کے لیے لاگ ان کریں", HI: "पसंद करने के लिए कृपया लॉगिन करें" },
    loginToComment: { EN: "Please login to comment", UR: "برائے کرم تبصرہ کے لیے لاگ ان کریں", HI: "टिप्पणी करने के लिए कृपया लॉगिन करें" },
    commentSubmitted: { EN: "Comment submitted successfully", UR: "تبصرہ کامیابی سے جمع کر دیا گیا", HI: "टिप्पणी सफलतापूर्वक सबमिट की गई" },
    commentFailed: { EN: "Failed to submit comment", UR: "تبصرہ جمع کرنے میں ناکام", HI: "टिप्पणी सबमिट करने में विफल" },
    commentProcessing: { EN: "Submitting comment...", UR: "تبصرہ جمع کیا جا رہا ہے...", HI: "टिप्पणी सबमिट की जा रही है..." },
    likeProcessing: { EN: "Processing...", UR: "عمل جاری ہے...", HI: "प्रसंस्करण..." },
    likeAdded: { EN: "Added to favorites!", UR: "پسندیدہ میں شامل کر دیا گیا!", HI: "पसंदीदा में जोड़ा गया!" },
    likeRemoved: { EN: "Removed from favorites!", UR: "پسندیدہ سے ہٹا دیا گیا!", HI: "पसंदीदा से हटाया गया!" },
    authRequired: { EN: "Please sign in to continue", UR: "جاری رکھنے کے لیے لاگ ان کریں", HI: "जारी रखने के लिए साइन इन करें" },
    authSuccess: { EN: "Successfully signed in", UR: "کامیابی سے لاگ ان ہو گئے", HI: "सफलतापूर्वक साइन इन हो गए" },
    // New share/download specific
    shareSuccess: { EN: "Shared successfully", UR: "کامیابی سے شیئر کیا گیا", HI: "सफलतापूर्वक साझा किया गया" },
    shareCancelled: { EN: "Share cancelled", UR: "شیئر منسوخ کر دیا گیا", HI: "साझा करना रद्द किया गया" },
    shareRequired: { EN: "Please sign in to share", UR: "شیئر کرنے کے لیے لاگ ان کریں", HI: "साझा करने के लिए साइन इन करें" },
    downloadRequired: { EN: "Please sign in to download", UR: "ڈاؤن لوڈ کے لیے لاگ ان کریں", HI: "डाउनलोड के लिए साइन इन करें" },
    downloadSuccess: { EN: "Downloaded successfully", UR: "کامیابی سے ڈاؤن لوڈ ہو گیا", HI: "सफलतापूर्वक डाउनलोड किया गया" },
  },
  placeholders: {
    search: { EN: "Search...", UR: "تلاش کریں...", HI: "खोजें..." },
    comment: { EN: "Write a comment...", UR: "تبصرہ لکھیں...", HI: "टिप्पणी लिखें..." },
  },
  labels: {
    didYouKnow: { EN: "DID YOU KNOW?", UR: "کیا آپ جانتے ہیں؟", HI: "क्या आप जानते हैं?" },
    seeMore: { EN: "See More", UR: "مزید دیکھیں", HI: "और देखें" },
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
