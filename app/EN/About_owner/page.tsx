import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";
import Image from "next/image";

// Generate comprehensive metadata for English About Owner page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "About Owner | Jahannuma - Meet Our Founder",
    description: "Learn about the visionary founder and owner of Jahannuma, dedicated to preserving and promoting Urdu literature, poetry, and cultural heritage for future generations.",
    keywords: [
      "jahannuma founder",
      "about owner",
      "urdu literature advocate",
      "poetry promoter",
      "cultural preservationist",
      "literary visionary",
      "urdu heritage",
      "founder biography"
    ],
    url: "/EN/About_owner",
    image: "/metaImages/owner.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/About_owner",
      hi: "https://jahan-numa.org/HI/About_owner",
    },
  });
}

const AboutOwnerPage = () => {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - About Our Founder",
    description: "Learn about the visionary behind Jahannuma's mission to preserve Urdu literature",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/search",
    language: "en",
  });

  // Create founder/owner structured data
  const founderStructuredData = {
    "@type": "ProfilePage",
    "@id": "https://jahan-numa.org/EN/About_owner#profile",
    "name": "About Jahannuma Founder",
    "description": "Learn about the visionary founder dedicated to preserving and promoting Urdu literature",
    "url": "https://jahan-numa.org/EN/About_owner",
    "inLanguage": "en",
    "mainEntity": {
      "@type": "Person",
      "name": "Jahannuma Founder",
      "description": "Visionary founder dedicated to preserving and promoting Urdu literature and poetry",
      "worksFor": {
        "@type": "Organization",
        "name": "Jahannuma"
      },
      "knowsAbout": ["Urdu Literature", "Poetry", "Cultural Heritage", "Digital Preservation"]
    }
  };

  // Create breadcrumb structured data
  const breadcrumbData = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://jahan-numa.org/EN"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "About Owner",
        "item": "https://jahan-numa.org/EN/About_owner"
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">About Our Founder</h1>
          <p className="text-lg text-gray-600">Meet the visionary behind Jahannuma</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <Image
                src="/founders/founder.jpg"
                alt="Jahannuma Founder"
                width={300}
                height={300}
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Jahannuma was founded with a passionate vision to preserve, promote, and make accessible
                the rich heritage of Urdu literature and poetry. Our founder recognized the urgent need
                to digitize and share this cultural treasure with the world.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                With years of dedication to Urdu literature and a deep understanding of its cultural
                significance, our founder has created a platform that bridges the gap between classical
                poetry and modern accessibility.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Through Jahannuma, we aim to ensure that the beautiful words of renowned poets continue
                to inspire and touch hearts across generations and geographical boundaries.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Preserve classical Urdu poetry and literature
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Make literature accessible to global audiences
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Support contemporary poets and writers
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Foster cultural understanding and appreciation
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Values</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Cultural preservation and respect
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Quality and authenticity in content
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Accessibility and inclusivity
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Community engagement and education
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Join Our Journey</h3>
          <p className="text-gray-700">
            We invite you to explore the beautiful world of Urdu literature with us and be part of
            preserving this invaluable cultural heritage for future generations.
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutOwnerPage;
