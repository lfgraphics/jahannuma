"use client";
import type { AirtableRecord } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableList } from "@/hooks/useAirtableList";
import { uiTexts } from "@/lib/multilingual-texts";
// Using string directly to avoid import issues during build
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";

interface BlogRecord {
  url?: string;
  photo?: { url?: string }[];
  unwan?: string;
  enUnwan?: string;
  hiUnwan?: string;
  text?: string;
  enText?: string;
  hiText?: string;
  background?: string;
}

// Fallback gradient options
const fallbackGradients = [
  "linear-gradient(90deg, rgba(87, 16, 16, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%)",
  "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(90deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)",
];

// Language-aware fallback data
const getFallbackCardsData = (language: string) => {
  const routePrefix = language === 'UR' ? '' : `/${language}`;

  switch (language) {
    case 'EN':
      return [
        // {
        //   unwan: "About Ustaad",
        //   content: `The word 'Ustaad' entered the Urdu language from Persian. Its journey began with the religious Zoroastrian book Awista, which was in the ancient Iranian language and had very few people who understood it. The person who understood Awista was known as 'Awista-wed'. The word 'wed' is still used for 'Hakim (wise)', or 'Daanaa (learned)'. Gradually, the word first became 'Awista-wid', and then morphed into 'Ustaad'. Originally, the word was used only for those who understood religious texts, but later became an appellation for everyone who taught and tutored. Nowadays, a master of an art or a skill is referred to as Ustaad, too. The word has become an inseparable part of the names of the virtuosos of Indian classical music. Today, in everyday speech, the word has taken a new meaning; being artful has come to be known as Ustaadi dikhaana. Endearingly, friends too address each other as Ustaad these days. In Indian films, characters of all sorts are depicted as Ustads, and films named 'Ustadon ke Ustad', 'Do Ustad', and 'Ustadi, Ustad Ki' are also found.`,
        //   img: "/logo.png",
        //   link: `${routePrefix}/About_site`,
        //   bgGradient: "linear-gradient(45deg, orange, green)",
        //   id: "fallback-1",
        // },
        {
          unwan: "History of Ghazal",
          content: `The ghazal has a rich history in Urdu literature. It originated from Persian poetry and found its place in Urdu, where great poets elevated it to new heights. The ghazal typically consists of rhyming couplets and expresses themes of love, loss, and longing.`,
          img: "/logo.png",
          link: `${routePrefix}/Ghazlen`,
          bgGradient: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          id: "fallback-2",
        },
        {
          unwan: "What is Nazm?",
          content: `Nazm is an important genre of Urdu poetry. It is based on a specific theme and the poet expresses their thoughts in an organized manner. Unlike ghazal, nazm follows a continuous narrative structure.`,
          img: "",
          link: `${routePrefix}/Nazmen`,
          bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          id: "fallback-3",
        },
      ];
    case 'HI':
      return [
        // {
        //   unwan: "उस्ताद के बारे में",
        //   content: `'उस्ताद' शब्द फारसी से उर्दू भाषा में आया। इसकी यात्रा धार्मिक जरथुस्त्री पुस्तक अविस्ता से शुरू हुई, जो प्राचीन ईरानी भाषा में थी और बहुत कम लोग इसे समझते थे। अविस्ता को समझने वाले व्यक्ति को 'अविस्ता-वेद' कहा जाता था। 'वेद' शब्द अभी भी 'हकीम (बुद्धिमान)' या 'दाना (विद्वान)' के लिए प्रयोग किया जाता है।`,
        //   img: "/logo.png",
        //   link: `${routePrefix}/About_site`,
        //   bgGradient: "linear-gradient(45deg, orange, green)",
        //   id: "fallback-1",
        // },
        {
          unwan: "ग़ज़ल का इतिहास",
          content: `उर्दू साहित्य में ग़ज़ल का एक समृद्ध इतिहास है। यह फारसी कविता से उत्पन्न हुई और उर्दू में अपना स्थान बनाया, जहाँ महान कवियों ने इसे नई ऊंचाइयों तक पहुंचाया। ग़ज़ल आमतौर पर तुकबंदी वाले शेरों से मिलकर बनती है।`,
          img: "/logo.png",
          link: `${routePrefix}/Ghazlen`,
          bgGradient: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          id: "fallback-2",
        },
        {
          unwan: "नज़्म क्या है?",
          content: `नज़्म उर्दू कविता की एक महत्वपूर्ण विधा है। यह किसी विशिष्ट विषय पर आधारित होती है और कवि अपने विचारों को व्यवस्थित तरीके से व्यक्त करता है। ग़ज़ल के विपरीत, नज़्म एक निरंतर कथा संरचना का पालन करती है।`,
          img: "",
          link: `${routePrefix}/Nazmen`,
          bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          id: "fallback-3",
        },
      ];
    default:
      return [
        // {
        //   unwan: "استاد کے بارے میں",
        //   content: `'استاد' کا لفظ فارسی سے اردو زبان میں آیا۔ اس کا سفر مذہبی زرتشتی کتاب اوستا سے شروع ہوا، جو قدیم ایرانی زبان میں تھی اور بہت کم لوگ اسے سمجھتے تھے۔ اوستا کو سمجھنے والے کو 'اوستا-وید' کہا جاتا تھا۔`,
        //   img: "/logo.png",
        //   link: `${routePrefix}/About_site`,
        //   bgGradient: "linear-gradient(45deg, orange, green)",
        //   id: "fallback-1",
        // },
        {
          unwan: "غزل کی تاریخ",
          content: `اردو ادب میں غزل کی تاریخ بہت پرانی ہے۔ غزل فارسی سے اردو میں آئی اور یہاں اپنا مقام بنایا۔ اردو کے عظیم شعراء نے غزل کو نئی بلندیوں تک پہنچایا۔`,
          img: "/logo.png",
          link: `${routePrefix}/Ghazlen`,
          bgGradient: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
          id: "fallback-2",
        },
        {
          unwan: "نظم کیا ہے؟",
          content: `نظم اردو شاعری کی ایک اہم صنف ہے۔ یہ کسی خاص موضوع پر مبنی ہوتی ہے اور اس میں شاعر اپنے خیالات کو منظم انداز میں بیان کرتا ہے۔`,
          img: "",
          link: `${routePrefix}/Nazmen`,
          bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          id: "fallback-3",
        },
      ];
  }
};

const getRandomGradient = () => {
  return fallbackGradients[
    Math.floor(Math.random() * fallbackGradients.length)
  ];
};

const DoYouKnow: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { language } = useLanguage();

  const { getClientBaseId } = require("@/lib/airtable-client-utils");
  const { records, isLoading, error } = useAirtableList<
    AirtableRecord<BlogRecord>
    >(getClientBaseId("DID_YOU_KNOW"), "Blogs links and data", { pageSize: 30 });

  const cards = useMemo(() => {
    // If there's an error or no records, use fallback data
    if (error || !records || records.length === 0) {
      return getFallbackCardsData(language);
    }

    return records.map((record) => {
      const fields = record.fields;

      // Get text based on language preference
      let content = "";
      if (language === "UR") {
        content = fields.text || fields.enText || fields.hiText || "";
      } else if (language === "EN") {
        content = fields.enText || fields.text || fields.hiText || "";
      } else if (language === "HI") {
        content = fields.hiText || fields.text || fields.enText || "";
      } else {
        content = fields.text || fields.enText || fields.hiText || "";
      }
      // Get text based on language preference
      let unwan = "";
      if (language === "UR") {
        unwan = fields.unwan || fields.enUnwan || fields.hiUnwan || "";
      } else if (language === "EN") {
        unwan = fields.enUnwan || fields.unwan || fields.hiUnwan || "";
      } else if (language === "HI") {
        unwan = fields.hiUnwan || fields.unwan || fields.enUnwan || "";
      } else {
        unwan = fields.unwan || fields.enUnwan || fields.hiUnwan || "";
      }

      return {
        content,
        unwan,
        img: fields.photo?.[0]?.url || "",
        link: fields.url || "",
        bgGradient:
          fields.background?.replace(/^background:\s*/, "") ||
          getRandomGradient(),
        id: record.id,
      };
    });
  }, [records, language, error]);

  const scrollLeft = () => {
    if (scrollPosition > 0) {
      setScrollPosition(scrollPosition - 1);
    }
  };

  const scrollRight = () => {
    if (scrollPosition < cards.length - 1) {
      setScrollPosition(scrollPosition + 1);
    }
  };

  if (isLoading && !error) {
    return (
      <div className="flex justify-center mt-3 mb-5 px-4">
        <div className="flex items-center justify-center gap-3 lg:w-[60vw] xl:w-[50vw] md:w-[70vw] sm:w-[80vw] w-[95vw] max-w-4xl">
          <div className="flex basis-[90%] justify-center overflow-hidden rounded-lg shadow-md h-[28rem] lg:h-[32rem] bg-gray-200 animate-pulse">
            <div className="w-full min-h-[100%] flex items-center justify-center">
              <div className="text-gray-500">{uiTexts.messages.loading[language]}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always show content (either from Airtable or fallback)
  const card = cards[scrollPosition];

  return (
    <div className="flex justify-center mt-3 mb-5 px-4">
      <div className="flex items-center justify-center gap-3 lg:w-[60vw] xl:w-[50vw] md:w-[70vw] sm:w-[80vw] w-[95vw] max-w-4xl">
        <div
          className={`transition-all duration-500 ease-in-out rounded-full border-2 border-solid border-grey-300 text-[#984A02] bg-grey-300 hover:text-white hover:bg-[#984A02] p-2 flex cursor-pointer ${scrollPosition == 0 ? " opacity-0" : ""
            }`}
          onClick={scrollLeft}
        >
          <ChevronLeft size={20} />
        </div>
        <div
          className="flex basis-[90%] justify-center overflow-hidden rounded-lg shadow-md h-[28rem] lg:h-[32rem] overflow-y-auto"
          style={{ background: card?.bgGradient }}
        >
          <div className="card w-full min-h-[100%] h-max">
            <div className="py-4 px-6 lg:py-6 lg:px-8 text-white text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-3">
                {uiTexts.labels.didYouKnow[language]}
              </h2>
              {card && card.img && (
                <div className="flex justify-center">
                  <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full shadow-lg mb-3 overflow-hidden bg-cover flex items-center justify-center">
                    <img
                      src={card.img}
                      alt=""
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <p
                dir={language === "UR" ? "rtl" : "ltr"}
                className={`text-sm md:text-base lg:text-lg text-black leading-relaxed max-w-3xl mx-auto ${language === "UR" ? "text-right" : "text-left"
                  }`}
              >
                {card?.content.split("\n").map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
              {card && card.link && (
                <Link
                  href={card.link}
                  className="text-blue-500 hover:text-blue-400 mt-4 block text-sm md:text-base"
                >
                  {uiTexts.labels.seeMore[language]}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div
          className={`transition-all duration-500 ease-in-out rounded-full border-2 border-solid border-grey-300 text-[#984A02] bg-grey-300 hover:text-white hover:bg-[#984A02] p-2 flex cursor-pointer${scrollPosition == cards.length - 1 ? " opacity-0" : ""
            }`}
          onClick={scrollRight}
        >
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
};

export default DoYouKnow;
