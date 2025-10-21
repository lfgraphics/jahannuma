import { useLanguage } from "@/contexts/LanguageContext";
import Loader from "../Loader";

const ComponentsLoader = () => {
  const { language } = useLanguage();

  const loadingText = {
    EN: "Loading...",
    HI: "लोड हो रहा है...",
    UR: "لوڈ ہو رہا ہے..."
  };

  return (
    <div className="h-[90vh] w-full flex items-center justify-center flex-col gap-4">
      <Loader />
      <div className="text-lg text-muted-foreground">{loadingText[language]}</div>
    </div>
  );
};

export default ComponentsLoader;
