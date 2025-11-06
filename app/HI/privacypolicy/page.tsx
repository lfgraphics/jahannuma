"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const PrivacyPolicyPage = () => {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="ltr">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">गोपनीयता नीति</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">हम जो जानकारी एकत्र करते हैं</h2>
            <p>
              जहाँनुमा में, हम आपकी गोपनीयता की सुरक्षा के लिए प्रतिबद्ध हैं। हम वह जानकारी एकत्र करते हैं
              जो आप हमें सीधे प्रदान करते हैं, जैसे कि जब आप खाता बनाते हैं, हमारी सेवाओं का उपयोग करते हैं,
              या सहायता के लिए हमसे संपर्क करते हैं।
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>खाता जानकारी (नाम, ईमेल पता)</li>
              <li>उपयोग डेटा और प्राथमिकताएं</li>
              <li>डिवाइस और ब्राउज़र जानकारी</li>
              <li>कुकीज़ और समान तकनीकें</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">हम आपकी जानकारी का उपयोग कैसे करते हैं</h2>
            <p>हम एकत्र की गई जानकारी का उपयोग निम्नलिखित के लिए करते हैं:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>हमारी सेवाओं को प्रदान, बनाए रखना और सुधारना</li>
              <li>आपके अनुभव को व्यक्तिगत बनाना</li>
              <li>हमारी सेवाओं के बारे में आपसे संवाद करना</li>
              <li>हमारे प्लेटफॉर्म की सुरक्षा सुनिश्चित करना</li>
              <li>कानूनी दायित्वों का अनुपालन</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">जानकारी साझाकरण</h2>
            <p>
              हम आपकी सहमति के बिना आपकी व्यक्तिगत जानकारी को तीसरे पक्ष को नहीं बेचते, व्यापार नहीं करते,
              या अन्यथा स्थानांतरित नहीं करते हैं, सिवाय इस नीति में वर्णित के अनुसार। हम जानकारी साझा कर सकते हैं:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>सेवा प्रदाताओं के साथ जो हमारे प्लेटफॉर्म के संचालन में हमारी सहायता करते हैं</li>
              <li>जब कानून द्वारा आवश्यक हो या हमारे अधिकारों की सुरक्षा के लिए</li>
              <li>व्यावसायिक लेनदेन के संबंध में</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">डेटा सुरक्षा</h2>
            <p>
              हम अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण, या विनाश के खिलाफ आपकी व्यक्तिगत जानकारी की सुरक्षा
              के लिए उपयुक्त सुरक्षा उपाय लागू करते हैं। हालांकि, इंटरनेट पर प्रसारण की कोई भी विधि 100% सुरक्षित नहीं है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">आपके अधिकार</h2>
            <p>आपको निम्नलिखित अधिकार हैं:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>अपनी व्यक्तिगत जानकारी तक पहुंच और अपडेट करना</li>
              <li>अपने डेटा को हटाने का अनुरोध करना</li>
              <li>कुछ संचारों से बाहर निकलना</li>
              <li>डेटा पोर्टेबिलिटी का अनुरोध करना</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">कुकीज़</h2>
            <p>
              हम आपके अनुभव को बढ़ाने, उपयोग का विश्लेषण करने, और व्यक्तिगत सामग्री प्रदान करने के लिए
              कुकीज़ और समान तकनीकों का उपयोग करते हैं। आप अपने ब्राउज़र के माध्यम से कुकी सेटिंग्स को नियंत्रित कर सकते हैं।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">इस नीति में परिवर्तन</h2>
            <p>
              हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। हम इस पृष्ठ पर नई नीति पोस्ट करके
              और प्रभावी तिथि को अपडेट करके किसी भी महत्वपूर्ण परिवर्तन के बारे में आपको सूचित करेंगे।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">हमसे संपर्क करें</h2>
            <p>
              यदि आपके पास इस गोपनीयता नीति या हमारी प्रथाओं के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">जहाँनुमा सहायता</p>
              <p>ईमेल: privacy@jahannuma.com</p>
              <p>पता: [आपका व्यावसायिक पता]</p>
            </div>
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

export default PrivacyPolicyPage;