"use client";
import { useState, useEffect } from "react";
import Loader from "./Loader";
import "./quiz.css";

const Quiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [ans, setAns] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [insideBroser, setInsideBrowser] = useState(false);
  const [loading, setLoading] = useState(true);

  const todayDate = new Date().toLocaleDateString("en-GB");
  // Split the date components
  const dateComponents = todayDate.split("/");
  // Rearrange the components to the desired format "YYYY/MM/DD"
  const formattedDate = `${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const BASE_ID = "appX2cOtbO23MjpGI";
      const TABLE_NAME = "Quiz";

      const headers = {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
      };

      // Include filterByFormula in the query parameters
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

      const response = await fetch(url, { method: "GET", headers });
      const result = await response.json();
      const records = result.records || [];

      const recordWithTodayDate = records.find(
        (record) =>
          new Date(record.fields.date).getTime() ===
          new Date(formattedDate).getTime()
      );
      setQuizData(recordWithTodayDate);
      setAns(recordWithTodayDate.fields?.ans);
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
    if (window.localStorage && quizData !== undefined) {
      const storedQuiz = localStorage.getItem("todaysQuiz");
      const userAnswer = localStorage.getItem("userAnswer");
      const quizAnswer = localStorage.getItem("quizAnswer");
      if (
        JSON.parse(storedQuiz)?.fields.date ==
        new Date().toISOString().split("T")[0]
      ) {
        if (userAnswer == quizAnswer) {
          document
            .getElementById(`ans${quizAnswer - 1}`)
            ?.classList.add("correct");
          setSelectedOption(userAnswer);
        } else {
          document
            .getElementById(`ans${quizAnswer - 1}`)
            ?.classList.add("correct");
          document
            .getElementById(`ans${userAnswer - 1}`)
            ?.classList.add("incorrect");
          setSelectedOption(userAnswer);
        }
      }
    }
  }, [quizData]);

  const handleOptionSelect = (index) => {
    if (selectedOption === null) {
      const isConfirmed = window.confirm("کیا آپ کا جواب لاک کیا جائے؟");
      if (isConfirmed) {
        setSelectedOption(index + 1);
        index + 1 == ans
          ? document.getElementById(`ans${index}`).classList.add("correct")
          : document.getElementById(`ans${index}`).classList.add("incorrect"),
          document.getElementById(`ans${ans - 1}`).classList.add("correct");
        localStorage.setItem("todaysQuiz", JSON.stringify(quizData));
        localStorage.setItem("quizAnswer", ans.toString());
        localStorage.setItem("userAnswer", (index + 1).toString());
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
          {insideBroser && quizData !== undefined && (
            <>
              <h2 className="text-4xl font-semibold text-center pb-4 text-[#984A02]">
                جہاں نما کوئز
              </h2>
              <h2 className="text-2xl text-center">
                {quizData.fields?.question}
              </h2>
              {["opt1", "opt2", "opt3", "opt4"].map((opt, index) => (
                <div className="text-center flex flex-col gap-6">
                  <button
                    key={index}
                    id={`ans${index}`}
                    className={`btn text-center `}
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
