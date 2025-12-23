"use client";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useEffect, useState } from "react";
import Loader from "./Loader";

interface QuizRecordFields {
  date?: string;
  question?: string;
  opt1?: string;
  opt2?: string;
  opt3?: string;
  opt4?: string;
  ans?: number;
  [key: string]: any;
}

interface QuizRecord {
  id?: string;
  fields: QuizRecordFields;
}

const Quiz = () => {
  const [quizData, setQuizData] = useState<QuizRecord | undefined>();
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const todayKey = new Date().toISOString().split("T")[0];
  const { records, isLoading } = useAirtableList<QuizRecord>(
    "appX2cOtbO23MjpGI",
    "Quiz",
    { pageSize: 50 }
  );

  useEffect(() => {
    const recs: QuizRecord[] = Array.isArray(records) ? (records as QuizRecord[]) : [];

    const toDateKey = (value: unknown): string | null => {
      if (typeof value !== "string" || !value.trim()) return null;
      const s = value.trim();
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
      const da = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${mo}-${da}`;
    };

    const recordWithTodayDate = recs.find((record) => {
      const recKey = toDateKey(record?.fields?.date);
      return recKey !== null && recKey === todayKey;
    });

    setQuizData(recordWithTodayDate ?? undefined);
    const parsedAns = typeof recordWithTodayDate?.fields?.ans === "number"
      ? recordWithTodayDate.fields.ans
      : Number(recordWithTodayDate?.fields?.ans);
    setCorrectAnswer(Number.isFinite(parsedAns) ? parsedAns : 0);
    setLoading(isLoading);
  }, [records, isLoading, todayKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage && quizData) {
      const storedQuiz = localStorage.getItem("todaysQuiz");
      const userAnswer = localStorage.getItem("userAnswer");

      if (storedQuiz && JSON.parse(storedQuiz)?.fields.date === todayKey) {
        setSelectedOption(Number(userAnswer));
      }
    }
  }, [quizData, todayKey]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption === null) {
      const isConfirmed = window.confirm("کیا آپ کا جواب لاک کیا جائے؟");
      if (isConfirmed) {
        const optionNumber = index + 1;
        setSelectedOption(optionNumber);

        if (quizData) {
          localStorage.setItem("todaysQuiz", JSON.stringify(quizData));
          localStorage.setItem("quizAnswer", correctAnswer.toString());
          localStorage.setItem("userAnswer", optionNumber.toString());
        }
      }
    }
  };

  const getOptionClasses = (index: number) => {
    const baseClasses = "w-full max-w-2xl mx-auto px-6 py-4 text-lg rounded-lg font-medium transition-all duration-300 transform";
    const optionNumber = index + 1;

    if (selectedOption === null) {
      return `${baseClasses} bg-gradient-to-r from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 text-gray-800 hover:scale-105 cursor-pointer border-2 border-orange-200 hover:border-orange-300 shadow-md hover:shadow-lg`;
    }

    if (optionNumber === correctAnswer) {
      return `${baseClasses} bg-gradient-to-r from-green-500 to-green-400 text-white border-2 border-green-600 shadow-xl animate-pulse`;
    }

    if (optionNumber === selectedOption && optionNumber !== correctAnswer) {
      return `${baseClasses} bg-gradient-to-r from-red-500 to-red-400 text-white border-2 border-red-600 shadow-xl animate-shake`;
    }

    return `${baseClasses} bg-gray-100 text-gray-500 border-2 border-gray-200 opacity-60`;
  };

  if (!quizData) {
    return null;
  }

  return (
    <div className="py-12 px-4">
      {loading && (
        <div className="text-center">
          <Loader />
        </div>
      )}
      {!loading && quizData && (
        <div className="quiz max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center pb-6 text-primary">
            جہاں نما کوئز
          </h2>
          <h3 className="text-2xl md:text-3xl text-center mb-8 text-gray-800 font-medium">
            {quizData.fields?.question}
          </h3>
          <div className="space-y-4 flex flex-col ">
            {["opt1", "opt2", "opt3", "opt4"].map((opt, index) => (
              <button
                key={opt}
                className={getOptionClasses(index)}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
              >
                {quizData.fields?.[opt]}
              </button>
            ))}
          </div>
          {selectedOption !== null && (
            <div className="mt-8 text-center">
              {selectedOption === correctAnswer ? (
                <p className="text-2xl font-bold text-green-600 animate-bounce">
                  ✅ شاندار! صحیح جواب
                </p>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  ❌ غلط جواب
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
