"use client";
import { useState, useEffect, useMemo } from "react";
import Loader from "./Loader";
import "./quiz.css";
import { useAirtableList } from "@/hooks/useAirtableList";

interface QuizRecordFields {
  date?: string;
  question?: string;
  opt1?: string;
  opt2?: string;
  opt3?: string;
  opt4?: string;
  ans?: number;
  [key: string]: any; // Allow extra Airtable fields
}

interface QuizRecord {
  id?: string;
  fields: QuizRecordFields;
}

const Quiz = () => {
  const [quizData, setQuizData] = useState<QuizRecord | undefined>();
  const [ans, setAns] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [insideBrowser, setInsideBrowser] = useState(false);
  const [loading, setLoading] = useState(true);

  // Derive today's normalized key in UTC (YYYY-MM-DD)
  const todayKey = new Date().toISOString().split("T")[0];
  const { records, isLoading } = useAirtableList<QuizRecord>(
    "appX2cOtbO23MjpGI",
    "Quiz",
    { pageSize: 50 }
  );
  useEffect(() => {
    setInsideBrowser(true);

    // Validate records as an array before use
    const recs: QuizRecord[] = Array.isArray(records) ? (records as QuizRecord[]) : [];

    // Normalize a record's date into a YYYY-MM-DD key (UTC)
    const toDateKey = (value: unknown): string | null => {
      if (typeof value !== "string" || !value.trim()) return null;
      const s = value.trim();
      // If already date-only ISO (YYYY-MM-DD), use directly
      const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[1]}-${m[2]}-${m[3]}`;
      // Fallback to Date parsing and normalize to UTC date-only
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      const y = d.getUTCFullYear();
      const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
      const da = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${mo}-${da}`;
    };

    // Precompute today's key once (already memoized via todayKey)
    const keyToday = todayKey;

    const recordWithTodayDate = recs.find((record) => {
      const recKey = toDateKey(record?.fields?.date);
      return recKey !== null && recKey === keyToday;
    });

    setQuizData(recordWithTodayDate ?? undefined);
    const parsedAns = typeof recordWithTodayDate?.fields?.ans === "number"
      ? recordWithTodayDate.fields.ans
      : Number(recordWithTodayDate?.fields?.ans);
    setAns(Number.isFinite(parsedAns) ? parsedAns : 0);
    setLoading(isLoading);
  }, [records, isLoading, todayKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage && quizData) {
      const storedQuiz = localStorage.getItem("todaysQuiz");
      const userAnswer = localStorage.getItem("userAnswer");
      const quizAnswer = localStorage.getItem("quizAnswer");
      if (
        storedQuiz &&
        JSON.parse(storedQuiz)?.fields.date === new Date().toISOString().split("T")[0]
      ) {
        if (userAnswer === quizAnswer) {
          document
            .getElementById(`ans${Number(quizAnswer) - 1}`)
            ?.classList.add("correct");
          setSelectedOption(Number(userAnswer));
        } else if (quizAnswer && userAnswer) {
          document
            .getElementById(`ans${Number(quizAnswer) - 1}`)
            ?.classList.add("correct");
          document
            .getElementById(`ans${Number(userAnswer) - 1}`)
            ?.classList.add("incorrect");
          setSelectedOption(Number(userAnswer));
        }
      }
    }
  }, [quizData]);

  const handleOptionSelect = (index: number) => {
    if (selectedOption === null) {
      const isConfirmed = window.confirm("کیا آپ کا جواب لاک کیا جائے؟");
      if (isConfirmed) {
        setSelectedOption(index + 1);
        if (index + 1 === ans) {
          document.getElementById(`ans${index}`)?.classList.add("correct");
        } else {
          document.getElementById(`ans${index}`)?.classList.add("incorrect");
          document.getElementById(`ans${ans - 1}`)?.classList.add("correct");
        }
        if (quizData) {
          localStorage.setItem("todaysQuiz", JSON.stringify(quizData));
          localStorage.setItem("quizAnswer", ans.toString());
          localStorage.setItem("userAnswer", (index + 1).toString());
        }
      }
    }
  };

  return (
    <>
      {quizData && (
        <div className="quiz p-8">
          {loading && (
            <div className="text-center">
              <Loader />
            </div>
          )}
          {insideBrowser && quizData !== undefined && (
            <>
              <h2 className="text-4xl font-semibold text-center pb-4 text-primary">
                جہاں نما کوئز
              </h2>
              <h2 className="text-2xl text-center">
                {quizData.fields?.question}
              </h2>
              {["opt1", "opt2", "opt3", "opt4"].map((opt, index) => (
                <div key={opt} className="text-center flex flex-col gap-6">
                  <button
                    id={`ans${index}`}
                    className="btn text-center"
                    onClick={() => handleOptionSelect(index)}
                    disabled={selectedOption !== null}
                  >
                    {quizData.fields?.[opt]}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Quiz;
