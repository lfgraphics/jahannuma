"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { navPages } from "@/lib/multilingual-texts";
import Link from "next/link";

const Branches = () => {
  const { language } = useLanguage();
  const routePrefix = language === 'UR' ? '' : `/${language}`;

  const branches = [
    {
      href: `${routePrefix}/bazmeurdu`,
      image: "/branches/urdu.jpeg",
      alt: "Bazme urdu Image",
      title: { EN: "Bazm-e-Urdu", UR: "بزم اردو", HI: "बज़्म-ए-उर्दू" }
    },
    {
      href: `${routePrefix}/bazmehindi`,
      image: "/branches/hindi.jpeg",
      alt: "Bazme hindi Image",
      title: { EN: "Bazm-e-Hindi", UR: "بزم ہندی", HI: "बज़्म-ए-हिंदी" }
    },
    {
      href: `${routePrefix}/Blogs`,
      image: "/branches/blog.jpeg",
      alt: "blogs Image",
      title: navPages.find(p => p.EN === "Blogs") || { EN: "Blogs", UR: "بلاگز", HI: "ब्लॉग्स" }
    },
    {
      href: `${routePrefix}/Interview`,
      image: "/branches/interviews.jpeg",
      alt: "interview Image",
      title: navPages.find(p => p.EN === "Interview") || { EN: "Interviews", UR: "انٹرویوز", HI: "इंटरव्यूज़" }
    }
  ];

  const branchesTitle = { EN: "Jahannuma Branches", UR: "جہاں نما کی شاخیں", HI: "जहाँनुमा शाखाएं" };

  return (
    <div>
      <div className="bg-gray-100 dark:bg-[#2d2d2f]">
        <div className="pt-7 text-2xl text-center">
          {branchesTitle[language]}
        </div>
        <div className="w-full overflow-x-auto">
          <div className="flex flex-row w-max">
            {branches.map((branch, index) => (
              <div key={index} className="rounded-md overflow-hidden border-2 w-[300px] h-[350px] m-3 shadow-md relative text-center">
                <Link href={branch.href}>
                  <img
                    src={branch.image}
                    alt={branch.alt}
                    width={300}
                    height={300}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-card text-card-foreground p-4 text-xl">
                    <p>{branch.title[language]}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;
