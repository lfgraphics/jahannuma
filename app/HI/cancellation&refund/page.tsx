"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const CancellationRefundPage = () => {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="ltr">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">रद्दीकरण और वापसी नीति</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">अवलोकन</h2>
            <p>
              जहाँनुमा में, हम अपने उपयोगकर्ताओं के लिए सर्वोत्तम संभावित अनुभव प्रदान करने का प्रयास करते हैं।
              यह नीति हमारी डिजिटल सेवाओं और उत्पादों के लिए रद्दीकरण और वापसी के नियमों और शर्तों को रेखांकित करती है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">डिजिटल सामग्री और सेवाएं</h2>
            <p>
              डिजिटल सामग्री और सेवाओं की प्रकृति के कारण, सभी बिक्री आम तौर पर अंतिम होती है।
              हालांकि, हम समझते हैं कि असाधारण परिस्थितियां उत्पन्न हो सकती हैं।
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="font-medium text-blue-800">महत्वपूर्ण नोट:</p>
              <p className="text-blue-700">
                एक बार डिजिटल सामग्री तक पहुंच या डाउनलोड हो जाने पर, इसे पारंपरिक अर्थ में वापस नहीं किया जा सकता।
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">वापसी की पात्रता</h2>
            <p>निम्नलिखित परिस्थितियों में वापसी पर विचार किया जा सकता है:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>तकनीकी समस्याएं जो खरीदी गई सामग्री तक पहुंच को रोकती हैं</li>
              <li>गलती से की गई डुप्लिकेट खरीदारी</li>
              <li>अनधिकृत लेनदेन (सत्यापन के अधीन)</li>
              <li>विवरण से काफी अलग सामग्री</li>
              <li>विस्तारित अवधि के लिए सेवा अनुपलब्धता</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">वापसी प्रक्रिया</h2>
            <p>वापसी का अनुरोध करने के लिए, कृपया इन चरणों का पालन करें:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>खरीदारी के 7 दिनों के भीतर हमारी सहायता टीम से संपर्क करें</li>
              <li>अपना ऑर्डर नंबर और वापसी अनुरोध का कारण प्रदान करें</li>
              <li>कोई भी प्रासंगिक दस्तावेज या स्क्रीनशॉट शामिल करें</li>
              <li>समीक्षा और प्रसंस्करण के लिए 3-5 व्यावसायिक दिनों की अनुमति दें</li>
            </ol>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mt-4">
              <p className="font-medium text-yellow-800">प्रसंस्करण समय:</p>
              <p className="text-yellow-700">
                स्वीकृत वापसी आपकी मूल भुगतान विधि में 5-10 व्यावसायिक दिनों के भीतर संसाधित की जाएगी।
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">सदस्यता सेवाएं</h2>
            <p>सदस्यता-आधारित सेवाओं के लिए:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>आप किसी भी समय अपनी सदस्यता रद्द कर सकते हैं</li>
              <li>रद्दीकरण वर्तमान बिलिंग अवधि के अंत में प्रभावी होता है</li>
              <li>आंशिक सदस्यता अवधि के लिए कोई वापसी नहीं</li>
              <li>भुगतान की गई अवधि के अंत तक पहुंच जारी रहती है</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">गैर-वापसी योग्य आइटम</h2>
            <p>निम्नलिखित आइटम वापसी के लिए पात्र नहीं हैं:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>डिजिटल सामग्री जिसे पूरी तरह से एक्सेस या डाउनलोड किया गया है</li>
              <li>सेवाएं जो पूरी तरह से वितरित की गई हैं</li>
              <li>30 दिन से अधिक पुरानी खरीदारी</li>
              <li>प्रमोशनल कोड के साथ या बिक्री के दौरान खरीदे गए आइटम</li>
              <li>अनुकूलित या व्यक्तिगत सामग्री</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">रद्दीकरण नीति</h2>
            <p>
              आपको खरीदारी के 24 घंटों के भीतर अपना ऑर्डर रद्द करने का अधिकार है, बशर्ते कि
              डिजिटल सामग्री तक पहुंच या डाउनलोड न किया गया हो। इस अवधि के बाद,
              रद्दीकरण हमारी वापसी नीति की शर्तों के अधीन हैं।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">विवाद समाधान</h2>
            <p>
              यदि आप हमारे वापसी निर्णय से संतुष्ट नहीं हैं, तो आप मामले को हमारी प्रबंधन टीम तक
              बढ़ा सकते हैं। हम सभी पक्षों के लिए निष्पक्ष समाधान खोजने के लिए प्रतिबद्ध हैं।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">भुगतान विधि विशिष्ट नियम</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">क्रेडिट/डेबिट कार्ड</h3>
                <p>वापसी 5-10 व्यावसायिक दिनों के भीतर आपके स्टेटमेंट में दिखाई देगी।</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">डिजिटल वॉलेट</h3>
                <p>डिजिटल वॉलेट में वापसी को प्रसंस्करण में 1-3 व्यावसायिक दिन लग सकते हैं।</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">बैंक ट्रांसफर</h3>
                <p>बैंक ट्रांसफर वापसी में आपके बैंक के आधार पर 3-7 व्यावसायिक दिन लग सकते हैं।</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">संपर्क जानकारी</h2>
            <p>
              रद्दीकरण और वापसी अनुरोधों के लिए, कृपया हमारी सहायता टीम से संपर्क करें:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">जहाँनुमा ग्राहक सहायता</p>
              <p>ईमेल: support@jahannuma.com</p>
              <p>फोन: [आपका सहायता फोन नंबर]</p>
              <p>समय: सोमवार - शुक्रवार, सुबह 9:00 - शाम 6:00</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">नीति अपडेट</h2>
            <p>
              हम किसी भी समय इस रद्दीकरण और वापसी नीति को अपडेट करने का अधिकार सुरक्षित रखते हैं।
              परिवर्तन हमारी वेबसाइट पर पोस्ट करने के तुरंत बाद प्रभावी होंगे। हमारी सेवाओं का निरंतर उपयोग
              अपडेटेड नीति की स्वीकृति का गठन करता है।
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              अंतिम अपडेट: {new Date().toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefundPage;