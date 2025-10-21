export const metadata = {
  metadataBase: new URL("https://jahan-numa.org/HI/Contact"),
  title: "संपर्क करें | जहाननुमा - हमसे जुड़ें",
  description: "उर्दू कविता, साहित्य और सांस्कृतिक सामग्री के बारे में पूछताछ के लिए जहाननुमा से संपर्क करें। सहायता, फीडबैक या सहयोग के अवसरों के लिए हमारी टीम से संपर्क करें।",
  openGraph: {
    images: ["https://jahan-numa.org/metaImages/contact.jpg"],
  },
};

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">हमसे संपर्क करें</h1>
        <p className="text-xl text-gray-600">हम आपसे सुनना पसंद करेंगे</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">संपर्क में रहें</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">📧</div>
              <div>
                <h3 className="font-semibold text-gray-800">ईमेल</h3>
                <p className="text-gray-600">contact@jahan-numa.org</p>
                <p className="text-sm text-gray-500">हम 24 घंटे के भीतर जवाब देंगे</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">🌐</div>
              <div>
                <h3 className="font-semibold text-gray-800">वेबसाइट</h3>
                <p className="text-gray-600">www.jahan-numa.org</p>
                <p className="text-sm text-gray-500">हमारी डिजिटल लाइब्रेरी देखें</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="text-blue-600 text-xl">📱</div>
              <div>
                <h3 className="font-semibold text-gray-800">सोशल मीडिया</h3>
                <p className="text-gray-600">अपडेट के लिए हमें फॉलो करें</p>
                <p className="text-sm text-gray-500">हमारे समुदाय से जुड़ें</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">हमें संदेश भेजें</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                नाम
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="आपका पूरा नाम"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                ईमेल
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
                विषय
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="यह किस बारे में है?"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                संदेश
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="बताएं कि हम आपकी कैसे मदद कर सकते हैं..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-semibold"
            >
              संदेश भेजें
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">हम कैसे मदद कर सकते हैं?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-800 mb-2">सामग्री पूछताछ</h3>
            <p className="text-gray-600 text-sm">
              हमारे कविता संग्रह, अनुवाद, या विशिष्ट कार्यों के बारे में प्रश्न
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="font-semibold text-gray-800 mb-2">सहयोग</h3>
            <p className="text-gray-600 text-sm">
              साझेदारी के अवसर, सामग्री योगदान, या शैक्षणिक सहयोग
            </p>
          </div>

          <div className="text-center">
            <div className="text-3xl mb-3">💡</div>
            <h3 className="font-semibold text-gray-800 mb-2">फीडबैक</h3>
            <p className="text-gray-600 text-sm">
              सुधार के सुझाव, बग रिपोर्ट, या फीचर अनुरोध
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
