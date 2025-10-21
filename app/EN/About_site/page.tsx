import Image from "next/image";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/EN/About_site"),
  title: "About Site | Jahannuma - Digital Library of Urdu Literature",
  description: "Learn about Jahannuma - A comprehensive digital platform for Urdu poetry, literature, and cultural heritage. Discover our mission to preserve and promote Urdu literature.",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/about.jpg"],
  },
};

const AboutSitePage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">About Jahannuma</h1>
        <p className="text-xl text-gray-600">Your Digital Gateway to Urdu Literature</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Jahannuma Logo"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Welcome to Jahannuma</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Jahannuma is a comprehensive digital platform dedicated to preserving, promoting, and
              sharing the rich heritage of Urdu poetry and literature. Our name "Jahannuma" means
              "world-showing" or "guide to the world," reflecting our mission to be your guide
              through the beautiful world of Urdu literary arts.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We believe that poetry transcends boundaries and connects hearts across cultures.
              Through our platform, we aim to make the timeless beauty of Urdu literature accessible
              to readers worldwide, regardless of their linguistic background.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="text-blue-600 text-3xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Vast Collection</h3>
          <p className="text-gray-700">
            Explore thousands of poems, ghazals, nazms, and rubais from classical and contemporary poets.
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="text-green-600 text-3xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Multilingual Access</h3>
          <p className="text-gray-700">
            Experience literature in Urdu, English, and Hindi translations to reach diverse audiences.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="text-purple-600 text-3xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Cultural Heritage</h3>
          <p className="text-gray-700">
            Discover the stories behind the poets and the cultural context of their masterpieces.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Poetry Collections</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Link href="/EN/Ashaar" className="text-blue-600 hover:underline">• Ashaar (Couplets)</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/Ghazlen" className="text-blue-600 hover:underline">• Ghazlen (Ghazals)</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/Nazmen" className="text-blue-600 hover:underline">• Nazmen (Poems)</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/Rubai" className="text-blue-600 hover:underline">• Rubai (Quatrains)</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Resources</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <Link href="/EN/Shaer" className="text-blue-600 hover:underline">• Poet Profiles</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/E-Books" className="text-blue-600 hover:underline">• E-Books Collection</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/Blogs" className="text-blue-600 hover:underline">• Literary Blogs</Link>
              </li>
              <li className="flex items-center">
                <Link href="/EN/Interviews" className="text-blue-600 hover:underline">• Poet Interviews</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Join Our Literary Community</h2>
        <p className="text-blue-100 mb-6">
          Discover the beauty of Urdu poetry, connect with fellow literature enthusiasts,
          and be part of preserving this magnificent cultural heritage.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/EN/Ashaar"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Explore Poetry
          </Link>
          <Link
            href="/EN/Contact"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutSitePage;
