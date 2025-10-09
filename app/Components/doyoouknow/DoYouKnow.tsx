"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { BLOGS_BASE, BLOGS_TABLE } from "@/lib/airtable-constants";
import type { AirtableRecord } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";

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

// Fallback static data when Airtable is not available
const fallbackCardsData = [
  {
    content: `The word 'Ustaad' entered the Urdu language from Persian. Its journey began with the religious Zoroastrian book Awista, which was in the ancient Iranian language and had very few people who understood it. The person who understood Awista was known as 'Awista-wed'. The word 'wed' is still used for 'Hakim (wise)', or 'Daanaa (learned)'. Gradually, the word first became 'Awista-wid', and then morphed into 'Ustaad'. Originally, the word was used only for those who understood religious texts, but later became an appellation for everyone who taught and tutored. Nowadays, a master of an art or a skill is referred to as Ustaad, too. The word has become an inseparable part of the names of the virtuosos of Indian classical music. Today, in everyday speech, the word has taken a new meaning; being artful has come to be known as Ustaadi dikhaana. Endearingly, friends too address each other as Ustaad these days. In Indian films, characters of all sorts are depicted as Ustads, and films named 'Ustadon ke Ustad', 'Do Ustad', and 'Ustadi, Ustad Ki' are also found.`,
    img: "/logo.png",
    link: "/About_site",
    bgGradient: "linear-gradient(45deg, orange, green)",
    id: "fallback-1",
  },
  {
    content: `اردو ادب میں غزل کی تاریخ بہت پرانی ہے۔ غزل فارسی سے اردو میں آئی اور یہاں اپنا مقام بنایا۔ اردو کے عظیم شعراء نے غزل کو نئی بلندیوں تک پہنچایا۔`,
    img: "/logo.png",
    link: "/Ghazlen",
    bgGradient: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
    id: "fallback-2",
  },
  {
    content: `نظم اردو شاعری کی ایک اہم صنف ہے۔ یہ کسی خاص موضوع پر مبنی ہوتی ہے اور اس میں شاعر اپنے خیالات کو منظم انداز میں بیان کرتا ہے۔`,
    img: "",
    link: "/Nazmen",
    bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    id: "fallback-3",
  },
];

const getRandomGradient = () => {
  return fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)];
};

const DoYouKnow: React.FC = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const { language } = useLanguage();

  const { records, isLoading, error } = useAirtableList<AirtableRecord<BlogRecord>>(BLOGS_BASE, BLOGS_TABLE, { pageSize: 30 });

  const cards = useMemo(() => {
    // If there's an error or no records, use fallback data
    if (error || !records || records.length === 0) {
      return fallbackCardsData;
    }

    return records.map(record => {
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

      return {
        content,
        img: fields.photo?.[0]?.url || "",
        link: fields.url || "",
        bgGradient: fields.background?.replace(/^background:\s*/, '') || getRandomGradient(),
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
              <div className="text-gray-500">Loading...</div>
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
          className={`transition-all duration-500 ease-in-out rounded-full border-2 border-solid border-grey-300 text-[#984A02] bg-grey-300 hover:text-white hover:bg-[#984A02] p-2 flex cursor-pointer${scrollPosition == 0 ? " opacity-0" : ""
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
              <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold mb-3">
                کیا آپ جانتے ہیں؟
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
              <p className="text-sm md:text-base lg:text-lg text-black leading-relaxed max-w-3xl mx-auto">{card?.content}</p>
              {card && card.link && (
                <Link href={card.link} className="text-blue-500 hover:text-blue-400 mt-4 block text-sm md:text-base">
                  مزید دیکھیں
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
