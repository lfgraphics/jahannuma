import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for Hindi Programs page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "कार्यक्रम | जहाननुमा - साहित्यिक कार्यक्रम और गतिविधियां",
    description: "जहाननुमा के साहित्यिक कार्यक्रम, कविता कार्यक्रम, सांस्कृतिक गतिविधियां और उर्दू साहित्य और कविता को बढ़ावा देने वाली शैक्षणिक पहल की खोज करें।",
    keywords: [
      "साहित्यिक कार्यक्रम",
      "कविता कार्यक्रम",
      "उर्दू कार्यक्रम",
      "सांस्कृतिक गतिविधियां",
      "साहित्यिक कार्यक्रम",
      "कविता प्रतियोगिता",
      "शैक्षणिक कार्यक्रम",
      "जहाननुमा कार्यक्रम",
      "उर्दू संस्कृति कार्यक्रम"
    ],
    url: "/HI/Programs",
    image: "/metaImages/programs.jpg",
    language: "hi",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Programs",
      en: "https://jahan-numa.org/EN/Programs",
    },
  });
}

export default function Programs() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "जहाननुमा - साहित्यिक कार्यक्रम",
    description: "साहित्यिक कार्यक्रम, कविता कार्यक्रम और सांस्कृतिक गतिविधियां",
    url: "https://jahan-numa.org/HI",
    searchUrl: "https://jahan-numa.org/HI/Programs",
    language: "hi",
  });

  // Create programs collection structured data
  const programsStructuredData = {
    "@type": "Event",
    "@id": "https://jahan-numa.org/HI/Programs#programs",
    "name": "जहाननुमा साहित्यिक कार्यक्रम",
    "description": "उर्दू साहित्य को बढ़ावा देने वाले साहित्यिक कार्यक्रम, कविता कार्यक्रम और सांस्कृतिक गतिविधियां",
    "url": "https://jahan-numa.org/HI/Programs",
    "inLanguage": "hi",
    "organizer": {
      "@type": "Organization",
      "name": "जहाननुमा",
      "url": "https://jahan-numa.org"
    },
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled"
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
        "name": "कार्यक्रम",
        "item": "https://jahan-numa.org/HI/Programs"
      }
    ]
  };

  // Create comprehensive structured data graph
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      websiteStructuredData,
      programsStructuredData,
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">साहित्यिक कार्यक्रम</h1>
          <p className="text-xl text-gray-600">कार्यक्रमों और गतिविधियों के माध्यम से उर्दू साहित्य का जश्न</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🎭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">कविता पाठ</h3>
            <p className="text-gray-600 text-center mb-4">
              प्रसिद्ध कलाकारों द्वारा शास्त्रीय और समकालीन उर्दू कविता की लाइव प्रस्तुतियां।
            </p>
            <div className="text-sm text-gray-500 text-center">
              मासिक कार्यक्रम
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">साहित्यिक कार्यशालाएं</h3>
            <p className="text-gray-600 text-center mb-4">
              कविता लेखन, साहित्यिक विश्लेषण और उर्दू भाषा की सराहना पर इंटरैक्टिव सत्र।
            </p>
            <div className="text-sm text-gray-500 text-center">
              त्रैमासिक कार्यशालाएं
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">कविता प्रतियोगिताएं</h3>
            <p className="text-gray-600 text-center mb-4">
              उर्दू कविता और रचनात्मक लेखन में नई प्रतिभा को प्रोत्साहित करने वाली वार्षिक प्रतियोगिताएं।
            </p>
            <div className="text-sm text-gray-500 text-center">
              वार्षिक प्रतियोगिता
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🎤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">लेखक साक्षात्कार</h3>
            <p className="text-gray-600 text-center mb-4">
              कवियों, लेखकों और साहित्यिक विद्वानों के साथ उनके काम के बारे में विशेष बातचीत।
            </p>
            <div className="text-sm text-gray-500 text-center">
              द्विमासिक श्रृंखला
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🌍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">सांस्कृतिक आदान-प्रदान</h3>
            <p className="text-gray-600 text-center mb-4">
              साहित्य और कविता के माध्यम से अंतर-सांस्कृतिक समझ को बढ़ावा देने वाले कार्यक्रम।
            </p>
            <div className="text-sm text-gray-500 text-center">
              विशेष कार्यक्रम
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">पुस्तक लॉन्च</h3>
            <p className="text-gray-600 text-center mb-4">
              लेखकों और साहित्यिक समुदाय के साथ उर्दू साहित्य में नए प्रकाशनों का जश्न।
            </p>
            <div className="text-sm text-gray-500 text-center">
              निर्धारित अनुसार
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">आगामी कार्यक्रम</h2>
            <p className="text-blue-100 mb-6">
              हमारे साहित्यिक कार्यक्रमों और सांस्कृतिक कार्यक्रमों की रोमांचक श्रृंखला के लिए बने रहें।
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">वार्षिक कविता महोत्सव 2025</h3>
              <p className="text-blue-100 mb-2">दुनिया भर के प्रसिद्ध कवियों की विशेषता वाला उर्दू कविता का उत्सव</p>
              <p className="text-sm text-blue-200">जल्द आ रहा है - अपडेट रहें!</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">शामिल हों</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">प्रतिभागियों के लिए</h3>
              <p className="text-gray-600 mb-4">
                दर्शक, प्रतिभागी या स्वयंसेवक के रूप में हमारे कार्यक्रमों में शामिल हों।
                उर्दू साहित्य की सुंदरता का प्रत्यक्ष अनुभव करें।
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                कार्यक्रमों में शामिल हों
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">योगदानकर्ताओं के लिए</h3>
              <p className="text-gray-600 mb-4">
                अपनी विशेषज्ञता साझा करें, अपनी कविता प्रस्तुत करें, या कार्यक्रमों के आयोजन में मदद करें।
                उर्दू साहित्य के संरक्षण और प्रचार में योगदान दें।
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                योगदान दें
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
