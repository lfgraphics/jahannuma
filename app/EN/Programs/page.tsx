import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateWebsiteStructuredData } from "@/lib/seo/structured-data";
import { Metadata } from "next";

// Generate comprehensive metadata for English Programs page
export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Programs | Jahannuma - Literary Events & Activities",
    description: "Discover Jahannuma's literary programs, poetry events, cultural activities, and educational initiatives promoting Urdu literature and poetry.",
    keywords: [
      "literary programs",
      "poetry events",
      "urdu programs",
      "cultural activities",
      "literary events",
      "poetry competitions",
      "educational programs",
      "jahannuma events",
      "urdu culture programs"
    ],
    url: "/EN/Programs",
    image: "/metaImages/programs.jpg",
    language: "en",
    alternateLanguages: {
      ur: "https://jahan-numa.org/Programs",
      hi: "https://jahan-numa.org/HI/Programs",
    },
  });
}

export default function Programs() {
  // Generate structured data for SEO
  const websiteStructuredData = generateWebsiteStructuredData({
    name: "Jahannuma - Literary Programs",
    description: "Literary programs, poetry events, and cultural activities",
    url: "https://jahan-numa.org/EN",
    searchUrl: "https://jahan-numa.org/EN/Programs",
    language: "en",
  });

  // Create programs collection structured data
  const programsStructuredData = {
    "@type": "Event",
    "@id": "https://jahan-numa.org/EN/Programs#programs",
    "name": "Jahannuma Literary Programs",
    "description": "Literary programs, poetry events, and cultural activities promoting Urdu literature",
    "url": "https://jahan-numa.org/EN/Programs",
    "inLanguage": "en",
    "organizer": {
      "@type": "Organization",
      "name": "Jahannuma",
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
        "name": "Home",
        "item": "https://jahan-numa.org/EN"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Programs",
        "item": "https://jahan-numa.org/EN/Programs"
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Literary Programs</h1>
          <p className="text-xl text-gray-600">Celebrating Urdu Literature Through Events & Activities</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🎭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Poetry Recitals</h3>
            <p className="text-gray-600 text-center mb-4">
              Live performances featuring classical and contemporary Urdu poetry by renowned artists.
            </p>
            <div className="text-sm text-gray-500 text-center">
              Monthly Events
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Literary Workshops</h3>
            <p className="text-gray-600 text-center mb-4">
              Interactive sessions on poetry writing, literary analysis, and Urdu language appreciation.
            </p>
            <div className="text-sm text-gray-500 text-center">
              Quarterly Workshops
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Poetry Competitions</h3>
            <p className="text-gray-600 text-center mb-4">
              Annual competitions encouraging new talent in Urdu poetry and creative writing.
            </p>
            <div className="text-sm text-gray-500 text-center">
              Annual Contest
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🎤</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Author Interviews</h3>
            <p className="text-gray-600 text-center mb-4">
              Exclusive conversations with poets, writers, and literary scholars about their work.
            </p>
            <div className="text-sm text-gray-500 text-center">
              Bi-monthly Series
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">🌍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Cultural Exchange</h3>
            <p className="text-gray-600 text-center mb-4">
              Programs promoting cross-cultural understanding through literature and poetry.
            </p>
            <div className="text-sm text-gray-500 text-center">
              Special Events
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4 text-center">📖</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Book Launches</h3>
            <p className="text-gray-600 text-center mb-4">
              Celebrating new publications in Urdu literature with authors and literary community.
            </p>
            <div className="text-sm text-gray-500 text-center">
              As Scheduled
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-blue-100 mb-6">
              Stay tuned for our exciting lineup of literary programs and cultural events.
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">Annual Poetry Festival 2025</h3>
              <p className="text-blue-100 mb-2">A celebration of Urdu poetry featuring renowned poets from around the world</p>
              <p className="text-sm text-blue-200">Coming Soon - Stay Updated!</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Get Involved</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">For Participants</h3>
              <p className="text-gray-600 mb-4">
                Join our programs as an audience member, participant, or volunteer.
                Experience the beauty of Urdu literature firsthand.
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Join Programs
              </button>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">For Contributors</h3>
              <p className="text-gray-600 mb-4">
                Share your expertise, perform your poetry, or help organize events.
                Contribute to preserving and promoting Urdu literature.
              </p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Contribute
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
