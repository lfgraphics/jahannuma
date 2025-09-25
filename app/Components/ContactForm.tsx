"use client";
import React from "react";
import { useForm, ValidationError } from "@formspree/react";
// import { useForm } from "@formspree/react";
interface LangProps {
  language: string;
}

const ContactForm: React.FC<LangProps> = ({ language }) => {
  type Language = "EN" | "UR" | "HI";
  const [state, handleSubmit] = useForm("mvgplola");
  const fields = {
    name: { EN: "Name", UR: "نام", HI: "नाम" },
    mobile: { EN: "Contact Numebr", UR: "رابطہ نمبر", HI: "मोबाइल नंबर" },
    email: { EN: "E-mail", UR: "ای - میل", HI: "ई-मेल" },
    comment: { EN: "Message", UR: "پیغام", HI: "संदेश" },
    heading: {
      EN: "Get in Touch with us",
      UR: "ہم سے رابطہ کریں",
      HI: "हम से राबता करें",
    },
    successMsg: {
      EN: "Thanks for choosing us and showing interest. We've got your details and will contact you shortly.",
      UR: "اپنی تفصیلات بھییجنے کے لیے آپ کا شکریہ، ہم جلد ہی آپ سے رابطہ کریں گے",
      HI: "अपनी तफ़सीलत भेजने के लिए आप का शुक्रिया हम जल्द ही आप से राबता क़ायम करेंगे",
    },
    clear: { EN: "Clear", UR: "مِٹائیں", HI: "मिटाएँ" },
    submit: { EN: "Submit", UR: "بھیجیں", HI: "भेजें" },
    submitting: {
      EN: "Submitting....",
      UR: "بھیجا جا رہا ہے ۔۔۔۔",
      HI: "भेजा जा रहा है.....",
    },
    errormsg: {
      EN: "Error Occured, please re check your information",
      UR: "ارر آ گیا براہ کرم اپنی تفصیلات دبارا جانچ لیں",
      HI: "एरर आ गया बराहे करम अपनी तफ़सीलात दुबारा जांच लें",
    },
  };
  return (
    <form
      dir={language === "UR" ? "rtl" : "ltr"}
      onSubmit={handleSubmit}
      className="bg-background text-muted-foreground rounded-lg shadow-md p-6"
    >
      <h2 className="text-2xl mb-4 text-center">
        {fields.heading[language as Language]}
      </h2>
      {state.succeeded ? (
        <p
          className={`text-green-700 mb-4 ${
            language === "UR" ? "text-right" : "text-left"
          }`}
        >
          {fields.successMsg[language as Language]}
        </p>
      ) : state.submitting ? (
        fields.submitting[language as Language]
      ) : (
        <>
          <div className="mb-4">
            {state.errors && fields.errormsg[language as Language]}
            <label htmlFor="name" className="block mb-1">
              {fields.name[language as Language]}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              pattern=".{3,}"
              className="border p-2 rounded-md w-full"
              required
            />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>
          <div className="mb-4">
            <label htmlFor="contactNumber" className="block mb-1">
              {fields.mobile[language as Language]}
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              pattern="[0-9]{10}"
              className="border p-2 rounded-md w-full"
              required
            />
            <ValidationError
              prefix="Contact Number"
              field="contactNumber"
              errors={state.errors}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1">
              {fields.email[language as Language]}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              className="border p-2 rounded-md w-full"
            />
            <ValidationError
              field="email"
              prefix="Email"
              errors={state.errors}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="comment" className="block mb-1">
              {fields.comment[language as Language]}
            </label>
            <textarea
              id="comment"
              name="comment"
              required
              className="border p-2 rounded-md w-full h-28 text-xl"
            ></textarea>
            <ValidationError
              prefix="Comment"
              field="comment"
              errors={state.errors}
            />
          </div>
          <div className="flex gap-2 my-4">
            <button
              type="reset"
              disabled={state.submitting}
              className="bg-gray-500 p-2 rounded-md hover:bg-blue-700 w-full text-white"
            >
            {fields.clear[language as Language]}
            </button>
            <button
              type="submit"
              disabled={state.submitting}
              className="bg-blue-500 p-2 rounded-md hover:bg-blue-700 w-full text-white"
              >
              {fields.submit[language as Language]}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ContactForm;
