"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const ShippingDeliveryPage = () => {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="ltr">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">शिपिंग और डिलीवरी नीति</h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">अवलोकन</h2>
            <p>
              जहाँनुमा में, हम मुख्य रूप से डिजिटल सामग्री और सेवाएं प्रदान करते हैं जो इलेक्ट्रॉनिक रूप से
              वितरित की जाती हैं। हालांकि, यह नीति हमारी डिजिटल डिलीवरी और भविष्य में हम जो भी भौतिक उत्पाद
              पेश कर सकते हैं, दोनों को कवर करती है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">डिजिटल सामग्री डिलीवरी</h2>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <p className="font-medium text-green-800">तत्काल पहुंच:</p>
              <p className="text-green-700">
                सफल भुगतान सत्यापन के तुरंत बाद डिजिटल सामग्री वितरित की जाती है।
              </p>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">डिजिटल डिलीवरी प्रक्रिया:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>भुगतान प्रसंस्करण और सत्यापन (आमतौर पर मिनटों के भीतर)</li>
              <li>स्वचालित खाता सक्रियण या सामग्री अनलॉक</li>
              <li>पहुंच निर्देशों के साथ ईमेल पुष्टि</li>
              <li>आपके खाता डैशबोर्ड में तत्काल उपलब्धता</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">भौतिक उत्पाद (यदि लागू हो)</h2>
            <p>
              मुद्रित पुस्तकों, व्यापारिक वस्तुओं, या प्रचार सामग्री जैसे किसी भी भौतिक उत्पाद के लिए:
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">प्रसंस्करण समय:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>ऑर्डर प्रसंस्करण: 1-2 व्यावसायिक दिन</li>
              <li>मुद्रण और पैकेजिंग: 2-3 व्यावसायिक दिन</li>
              <li>शिपिंग तैयारी: 1 व्यावसायिक दिन</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">शिपिंग विधियां:</h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800">मानक शिपिंग</h4>
                <p className="text-sm text-gray-600">5-7 व्यावसायिक दिन</p>
                <p className="text-sm">सबसे किफायती विकल्प</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800">एक्सप्रेस शिपिंग</h4>
                <p className="text-sm text-gray-600">2-3 व्यावसायिक दिन</p>
                <p className="text-sm">तेज़ डिलीवरी विकल्प</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">शिपिंग लागत</h2>
            <p>शिपिंग लागत निम्नलिखित के आधार पर गणना की जाती है:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>गंतव्य पता</li>
              <li>पैकेज का वजन और आयाम</li>
              <li>चयनित शिपिंग विधि</li>
              <li>हमारे वाहकों से वर्तमान शिपिंग दरें</li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mt-4">
              <p className="font-medium text-blue-800">मुफ्त शिपिंग:</p>
              <p className="text-blue-700">
                ₹2000 से अधिक के ऑर्डर पर मुफ्त मानक शिपिंग (जहां लागू हो)।
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">डिलीवरी क्षेत्र</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">डिजिटल सामग्री</h3>
                <p>इंटरनेट पहुंच के साथ दुनिया भर में उपलब्ध</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">भौतिक उत्पाद</h3>
                <p>वर्तमान में शिपिंग:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>भारत (सभी राज्य और केंद्र शासित प्रदेश)</li>
                  <li>अंतर्राष्ट्रीय शिपिंग (चुनिंदा देश)</li>
                  <li>दूरदराज के क्षेत्रों में डिलीवरी का समय बढ़ सकता है</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">ऑर्डर ट्रैकिंग</h2>
            <p>भौतिक ऑर्डर के लिए, आपको प्राप्त होगा:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ऑर्डर नंबर के साथ ऑर्डर पुष्टि ईमेल</li>
              <li>ट्रैकिंग नंबर के साथ शिपिंग पुष्टि</li>
              <li>ईमेल/एसएमएस के माध्यम से रियल-टाइम ट्रैकिंग अपडेट</li>
              <li>डिलीवरी पुष्टि अधिसूचना</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">डिलीवरी समस्याएं</h2>
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">डिजिटल सामग्री समस्याएं:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>यदि सामग्री 1 घंटे के भीतर पहुंच योग्य नहीं है तो सहायता से संपर्क करें</li>
              <li>डिलीवरी ईमेल के लिए स्पैम फ़ोल्डर जांचें</li>
              <li>अपने खाते में भुगतान पूर्णता सत्यापित करें</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">भौतिक डिलीवरी समस्याएं:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>क्षतिग्रस्त पैकेज: डिलीवरी के 48 घंटों के भीतर रिपोर्ट करें</li>
              <li>खोए हुए पैकेज: अपेक्षित समय सीमा के भीतर डिलीवर नहीं होने पर हमसे संपर्क करें</li>
              <li>गलत पता: पुनः डिलीवरी के लिए अतिरिक्त शिपिंग शुल्क लग सकता है</li>
              <li>असफल डिलीवरी प्रयास: 3 प्रयासों के बाद पैकेज भेजने वाले को वापस कर दिया जाता है</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">अंतर्राष्ट्रीय शिपिंग</h2>
            <p>अंतर्राष्ट्रीय ऑर्डर के लिए:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>अतिरिक्त सीमा शुल्क और कर लग सकते हैं</li>
              <li>सीमा शुल्क प्रसंस्करण के कारण डिलीवरी समय भिन्न हो सकता है</li>
              <li>ग्राहक किसी भी आयात शुल्क के लिए जिम्मेदार है</li>
              <li>कुछ देशों में शिपिंग प्रतिबंध हो सकते हैं</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">पता परिवर्तन</h2>
            <p>
              पता परिवर्तन केवल ऑर्डर शिप होने से पहले संभव है। एक बार शिप हो जाने पर,
              हम डिलीवरी पता संशोधित नहीं कर सकते। कृपया अपना ऑर्डर पूरा करने से पहले
              सुनिश्चित करें कि आपका शिपिंग पता सही है।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">अप्रत्याशित परिस्थितियां</h2>
            <p>
              डिलीवरी समय हमारे नियंत्रण से बाहर की परिस्थितियों से प्रभावित हो सकता है, जिसमें
              प्राकृतिक आपदाएं, हड़ताल, सरकारी कार्रवाई, या वैश्विक घटनाएं शामिल हैं लेकिन इन्हीं तक सीमित नहीं हैं।
              हम किसी भी महत्वपूर्ण देरी के बारे में तुरंत संवाद करेंगे।
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">संपर्क जानकारी</h2>
            <p>
              शिपिंग और डिलीवरी पूछताछ के लिए, कृपया हमसे संपर्क करें:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">जहाँनुमा शिपिंग सहायता</p>
              <p>ईमेल: shipping@jahannuma.com</p>
              <p>फोन: [आपका शिपिंग सहायता नंबर]</p>
              <p>समय: सोमवार - शनिवार, सुबह 9:00 - शाम 7:00</p>
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

export default ShippingDeliveryPage;