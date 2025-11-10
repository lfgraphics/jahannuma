"use client";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Language = "EN" | "UR" | "HI";

const searchOptions = [
    { EN: "Ashaar", UR: "اشعار", HI: "अशआर" },
    { EN: "Ghazlen", UR: "غزلیں", HI: "गज़लें" },
    { EN: "Nazmen", UR: "نظمیں", HI: "नज़में" },
    { EN: "Rubai", UR: "رباعی", HI: "रुबाई" },
    { EN: "Shaer", UR: "شاعر", HI: "शायर" },
    { EN: "E-Books", UR: "ای بکس", HI: "ई-बुक्स" },
];

export default function SearchPage() {
    const { language } = useLanguage();
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<string>("");

    const handleSelectChange = (value: string) => {
        setSelectedOption(value);

        // Navigate to the selected page based on language
        const targetPath = language === "UR" ? `/${value}` : `/${language}/${value}`;
        router.push(targetPath);
    };

    return (
        <div className="min-h-screen pt-20 lg:pt-16 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="flex flex-col items-center gap-8">
                    <h1 className="text-3xl font-bold text-center">
                        {language === "UR" ? "تلاش کریں" : language === "EN" ? "Search" : "खोजें"}
                    </h1>

                    <div className="w-full max-w-md">
                        <div className="flex items-center gap-2 p-2 border rounded-lg bg-background">
                            {/* Select dropdown */}
                            <Select value={selectedOption} onValueChange={handleSelectChange}>
                                <SelectTrigger className="w-40 border-none shadow-none focus:ring-0">
                                    <SelectValue
                                        placeholder={
                                            language === "UR" ? "منتخب کریں" :
                                                language === "EN" ? "Select" :
                                                    "चुनें"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {searchOptions.map((option) => (
                                        <SelectItem key={option.EN} value={option.EN}>
                                            {option[language as Language]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Disabled input */}
                            <Input
                                disabled
                                placeholder={
                                    language === "UR" ? "پہلے کیٹگری منتخب کریں" :
                                        language === "EN" ? "Select category first" :
                                            "पहले श्रेणी चुनें"
                                }
                                className="flex-1 border-none shadow-none focus-visible:ring-0"
                            />

                            {/* Search icon */}
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mt-2">
                                {language === "UR" ?
                                    "اوپر سے کیٹگری منتخب کریں تاکہ متعلقہ صفحے پر جایا جا سکے" :
                                    language === "EN" ?
                                        "Select a category above to navigate to the respective page" :
                                        "संबंधित पृष्ठ पर जाने के लिए ऊपर से श्रेणी चुनें"
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
