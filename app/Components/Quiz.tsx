"use client";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import "./quiz.css";

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

  const todayDate = new Date().toLocaleDateString("en-GB");
  const dateComponents = todayDate.split("/");
  const formattedDate = `${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "appX2cOtbO23MjpGI";
      const TABLE_NAME = "Quiz";

      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      const records: QuizRecord[] = result.records || [];

      const recordWithTodayDate = records.find(
        (record) =>
          new Date(record.fields.date as string).getTime() ===
          new Date(formattedDate).getTime()
      );
      setQuizData(recordWithTodayDate);
      setAns((recordWithTodayDate?.fields?.ans as number) || 0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setInsideBrowser(true);
    fetchData();
  }, []);

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
