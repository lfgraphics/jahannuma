"use client";
import { useState, useEffect } from "react";
import "./quiz.css"; // You can use Tailwind classes in this CSS file

const Quiz = () => {
  const [quizData, setQuizData] = useState([]);
  const [ans, setAns] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [insideBroser, setInsideBrowser] = useState(false);
  const [clicked, setClicked] = useState(false);
  //   const [clicked, setClicked] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-GB");
  // Split the date components
  const dateComponents = todayDate.split("/");
  // Rearrange the components to the desired format "YYYY/MM/DD"
  const formattedDate = `${dateComponents[2]}-${dateComponents[1]}-${dateComponents[0]}`;

  const fetchData = async () => {
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
      console.log(recordWithTodayDate.fields?.ans);
    } catch (error) {
      console.error("Failed to fetch quiz data:", error);
    }
  };

  useEffect(() => {
    setInsideBrowser(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (window !== undefined && window.localStorage) {
      const storedQuizDataString = localStorage.getItem("todaysQuiz");
      if (storedQuizDataString) {
        try {
          const storedQuizData = JSON.parse(storedQuizDataString);

          // Check if stored data matches the current quizData
          if (
            quizData &&
            storedQuizData.fields &&
            JSON.stringify(storedQuizData.fields) ===
              JSON.stringify(quizData.fields)
          ) {
            // If the data matches, the user has already played today
            // Disable the buttons or perform any other logic
            document.getElementById(`ans0`)?.classList.add("disabled");
            document.getElementById(`ans1`)?.classList.add("disabled");
            document.getElementById(`ans2`)?.classList.add("disabled");
            document.getElementById(`ans3`)?.classList.add("disabled");

            // Simulate the logic that occurs when the user clicks an answer
            const storedQuizAnswer = localStorage.getItem("quizAnswer");
            if (storedQuizAnswer) {
              const answerIndex = parseInt(storedQuizAnswer) - 1;
              setSelectedOption(answerIndex + 1);
              localStorage.setItem("quizAnswer", (answerIndex + 1).toString());
              localStorage.setItem("todaysQuiz", JSON.stringify(quizData));
              setClicked(true);
            }
          }
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }
    }
  }, [quizData]);

  const handleOptionSelect = (index) => {
    // Show confirm only if an option is not already selected
    if (selectedOption === null) {
      const isConfirmed = window.confirm(
        "Lock this option and save to localStorage?"
      );
      if (isConfirmed) {
        setSelectedOption(index + 1);
        // Save the selected option to localStorage
        localStorage.setItem("quizAnswer", (index + 1).toString());
        localStorage.setItem("todaysQuiz", JSON.stringify(quizData));
        setClicked(true);
      }
    }
  };

  return (
    <div className="quiz p-8">
      {insideBroser && quizData !== undefined && (
        <>
          <h2 className="text-4xl font-semibold text-center m-7">
            جہاں نما کوئز
          </h2>
          <h2 className="text-2xl text-center font-semibold">
            {quizData.fields?.question}
          </h2>
          {["opt1", "opt2", "opt3", "opt4"].map((opt, index) => (
            <div className="text-center flex flex-col gap-6">
              <button
                key={index}
                id={`ans${index}`}
                className={`btn text-center ${
                  clicked ? (ans === index + 1 ? "correct" : "incorrect") : ""
                }
                  ${selectedOption !== null ? "disabled" : ""}`}
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
  );
};

export default Quiz;
