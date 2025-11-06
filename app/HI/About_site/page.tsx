import Image from "next/image";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/HI/About_site"),
  title: "साइट के बारे में | जहाननुमा - उर्दू साहित्य का डिजिटल पुस्तकालय",
  description: "जहाननुमा के बारे में जानें - उर्दू कविता, साहित्य और सांस्कृतिक विरासत के लिए एक व्यापक डिजिटल प्लेटफॉर्म। उर्दू साहित्य को संरक्षित और बढ़ावा देने के हमारे मिशन की खोज करें।",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/about.jpg"],
  },
};

const AboutSitePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">जहाननुमा के बारे में</h1>
        <p className="text-xl text-gray-600">उर्दू साहित्य का आपका डिजिटल द्वार</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="जहाननुमा लोगो"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">जहाननुमा में आपका स्वागत है</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              जहाननुमा उर्दू कविता और साहित्य की समृद्ध विरासत को संरक्षित करने, बढ़ावा देने और
              साझा करने के लिए समर्पित एक व्यापक डिजिटल प्लेटफॉर्म है। हमारा नाम "जहाननुमा" का
              अर्थ है "दुनिया दिखाने वाला" या "दुनिया का गाइड", जो उर्दू साहित्यिक कलाओं की
              सुंदर दुनिया में आपका गाइड बनने के हमारे मिशन को दर्शाता है।
            </p>
            <p className="text-gray-700 leading-relaxed">
              हमारा मानना है कि कविता सीमाओं को पार करती है और संस्कृतियों के पार दिलों को जोड़ती है।
              हमारे प्लेटफॉर्म के माध्यम से, हमारा लक्ष्य उर्दू साहित्य की कालातीत सुंदरता को दुनिया
              भर के पाठकों के लिए सुलभ बनाना है, चाहे उनकी भाषाई पृष्ठभूमि कुछ भी हो।
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="text-blue-600 text-3xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">विशाल संग्रह</h3>
          <p className="text-gray-700">
            शास्त्रीय और समकालीन कवियों की हजारों कविताएं, गजलें, नज्में और रुबाइयां देखें।
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="text-green-600 text-3xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">बहुभाषी पहुंच</h3>
          <p className="text-gray-700">
            विविध दर्शकों तक पहुंचने के लिए उर्दू, अंग्रेजी और हिंदी अनुवादों में साहित्य का अनुभव करें।
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="text-purple-600 text-3xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">सांस्कृतिक विरासत</h3>
          <p className="text-gray-700">
            कवियों के पीछे की कहानियों और उनकी कृतियों के सांस्कृतिक माख़ज़ की खोज करें।
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">हम क्या प्रदान करते हैं</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">कविता संग्रह</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Link href="/HI/Ashaar" className="text-blue-600 hover:underline">• अशआर (शेर)</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/Ghazlen" className="text-blue-600 hover:underline">• गजलें</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/Nazmen" className="text-blue-600 hover:underline">• नज्में</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/Rubai" className="text-blue-600 hover:underline">• रुबाई</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">अतिरिक्त संसाधन</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Link href="/HI/Shaer" className="text-blue-600 hover:underline">• कवि प्रोफाइल</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/E-Books" className="text-blue-600 hover:underline">• ई-बुक संग्रह</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/Blogs" className="text-blue-600 hover:underline">• साहित्यिक ब्लॉग</Link>
              </li>
              <li className="flex items-center">
                <Link href="/HI/Interviews" className="text-blue-600 hover:underline">• कवि साक्षात्कार</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">हमारे साहित्यिक समुदाय में शामिल हों</h2>
        <p className="text-blue-100 mb-6">
          उर्दू कविता की सुंदरता की खोज करें, साहित्य प्रेमियों से जुड़ें, और इस शानदार
          सांस्कृतिक विरासत को संरक्षित करने का हिस्सा बनें।
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/HI/Ashaar"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            कविता देखें
          </Link>
          <Link
            href="/HI/Contact"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            संपर्क करें
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutSitePage;
