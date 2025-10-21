export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/EN/Contact"),
  title: "Contact Us | Jahannuma - Get in Touch",
  description: "Contact Jahannuma for inquiries about Urdu poetry, literature, and cultural content. Get in touch with our team for support, feedback, or collaboration opportunities.",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/contact.jpg"],
  },
};

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
        <p className="text-xl text-gray-600">We'd love to hear from you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">📧</div>
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">contact@jahan-numa.org</p>
                <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">🌐</div>
              <div>
                <h3 className="font-semibold text-gray-800">Website</h3>
                <p className="text-gray-600">www.jahan-numa.org</p>
                <p className="text-sm text-gray-500">Explore our digital library</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">📱</div>
              <div>
                <h3 className="font-semibold text-gray-800">Social Media</h3>
                <p className="text-gray-600">Follow us for updates</p>
                <p className="text-sm text-gray-500">Connect with our community</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's this about?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us how we can help you..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">How Can We Help?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-800 mb-2">Content Inquiries</h3>
            <p className="text-gray-600 text-sm">
              Questions about our poetry collection, translations, or specific works
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-800 mb-2">Collaboration</h3>
            <p className="text-gray-600 text-sm">
              Partnership opportunities, content contributions, or academic collaborations
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-800 mb-2">Feedback</h3>
            <p className="text-gray-600 text-sm">
              Suggestions for improvement, bug reports, or feature requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
