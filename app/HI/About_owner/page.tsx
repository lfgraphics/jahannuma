import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Image from "next/image";

// Generate comprehensive metadata for Hindi About Owner page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "मालिक के बारे में | जहाननुमा - हमारे संस्थापक से मिलें",
    description: "जहाननुमा के दूरदर्शी संस्थापक और मालिक के बारे में जानें, जो भावी पीढ़ियों के लिए उर्दू साहित्य, कविता और सांस्कृतिक विरासत के संरक्षण और प्रचार के लिए समर्पित हैं।",
    keywords: [
      "जहाननुमा संस्थापक",
      "मालिक के बारे में",
      "उर्दू साहित्य समर्थक",
      "कविता प्रवर्तक",
      "सांस्कृतिक संरक्षणवादी",
      "साहित्यिक दूरदर्शी",
      "उर्दू विरासत",
      "संस्थापक जीवनी"
    ],
    url: "/HI/About_owner",
    image: "/metaImages/owner.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/About_owner",
      en: "https://jahan-numa.org/EN/About_owner",
    },
  });
}

const AboutOwnerPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - हमारे संस्थापक के बारे में",
    description: "उर्दू साहित्य के संरक्षण के मिशन के पीछे के दूरदर्शी के बारे में जानें",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/search",
    language: "hi",
  });

  // Create founder/owner structured data
  const founderStructuredData = {
    "@type": "ProfilePage",
    "@id": "https://jahan-numa.org/HI/About_owner#profile",
    "name": "जहाननुमा संस्थापक के बारे में",
    "description": "उर्दू साहित्य के संरक्षण और प्रचार के लिए समर्पित दूरदर्शी संस्थापक के बारे में जानें",
    "url": "https://jahan-numa.org/HI/About_owner",
    "inLanguage": "hi",
    "mainEntity": {
      "@type": "Person",
      "name": "जहाननुमा संस्थापक",
      "description": "उर्दू साहित्य और कविता के संरक्षण और प्रचार के लिए समर्पित दूरदर्शी संस्थापक",
      "worksFor": {
        "@type": "Organization",
        "name": "जहाननुमा"
      },
      "knowsAbout": ["उर्दू साहित्य", "कविता", "सांस्कृतिक विरासत", "डिजिटल संरक्षण"]
    }
  };

  // Create breadcrumb structured data
  const breadcrumbData = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "होम",
        "item": "https://jahan-numa.org/HI"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "मालिक के बारे में",
        "item": "https://jahan-numa.org/HI/About_owner"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      founderStructuredData,
      breadcrumbData
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">हमारे संस्थापक के बारे में</h1>
          <p className="text-lg text-gray-600">जहाननुमा के पीछे के दूरदर्शी से मिलें</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <Image
                src="/founders/founder.jpg"
                alt="जहाननुमा संस्थापक"
                width={300}
                height={300}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">हमारा दृष्टिकोण</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                जहाननुमा की स्थापना उर्दू साहित्य और कविता की समृद्ध विरासत को संरक्षित करने,
                बढ़ावा देने और सुलभ बनाने के एक भावुक दृष्टिकोण के साथ की गई थी। हमारे संस्थापक
                ने इस सांस्कृतिक खजाने को डिजिटाइज़ करने और दुनिया के साथ साझा करने की तत्काल
                आवश्यकता को पहचाना।
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                उर्दू साहित्य के प्रति वर्षों के समर्पण और इसके सांस्कृतिक महत्व की गहरी समझ के साथ,
                हमारे संस्थापक ने एक ऐसा मंच बनाया है जो शास्त्रीय कविता और आधुनिक पहुंच के बीच
                की खाई को पाटता है।
              </p>
              <p className="text-gray-700 leading-relaxed">
                जहाननुमा के माध्यम से, हमारा लक्ष्य यह सुनिश्चित करना है कि प्रसिद्ध कवियों के
                सुंदर शब्द पीढ़ियों और भौगोलिक सीमाओं के पार दिलों को प्रेरित और छूते रहें।
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">हमारा मिशन</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                शास्त्रीय उर्दू कविता और साहित्य का संरक्षण
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                वैश्विक दर्शकों के लिए साहित्य को सुलभ बनाना
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                समकालीन कवियों और लेखकों का समर्थन
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                सांस्कृतिक समझ और प्रशंसा को बढ़ावा देना
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">हमारे मूल्य</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                सांस्कृतिक संरक्षण और सम्मान
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                सामग्री में गुणवत्ता और प्रामाणिकता
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                पहुंच और समावेशिता
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                समुदायिक जुड़ाव और शिक्षा
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">हमारी यात्रा में शामिल हों</h3>
          <p className="text-gray-700">
            हम आपको हमारे साथ उर्दू साहित्य की सुंदर दुनिया का पता लगाने और भावी पीढ़ियों के
            लिए इस अमूल्य सांस्कृतिक विरासत को संरक्षित करने का हिस्सा बनने के लिए आमंत्रित करते हैं।
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutOwnerPage;
