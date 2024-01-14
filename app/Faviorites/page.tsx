"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import Ghazlen from "../Components/Ghazlen";
import Nazmen from "../Components/Nazmen";
import Ashaar from "../Components/Ashaar";
import Shura from "../Components/Shura";
import EBooks from "../Components/EBooks";

import "../Shaer/[name]/shaer.css";

// Assuming you have the necessary imports for your components like Intro2, Ghazlen, Nazmen, Ashaar, EBkooks, etc.

const YourPage = () => {
  const [activeNav, setActiveNav] = useState("غزلیں");

  const [commentorName, setCommentorName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    let name = localStorage.getItem("commentorName");
    setCommentorName(name || "");
  }, []);
  const handleNavClick = (nav: React.SetStateAction<string>) => {
    setActiveNav(nav);
  };

  const handleNameChange = (event: { target: { value: any } }) => {
    const newName = event.target.value;
    setCommentorName(newName);
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
  };

  const handleSaveNameClick = () => {
    setIsEditingName(false);
    localStorage.setItem("commentorName", commentorName);
  };

  let navs = ["غزلیں", "نظمیں", "اشعار", "شعرا", "ئی-بکس"];

  return (
    <div className="flex flex-col justify-center items-center">
      <label className="m-6">
        Your Name:{" "}
        {isEditingName ? (
          <>
            <input
              type="text"
              value={commentorName}
              onChange={handleNameChange}
            />
            <button onClick={handleSaveNameClick}>Save</button>
          </>
        ) : (
          <>
            {commentorName}
            <FontAwesomeIcon
              icon={faPencilAlt}
              onClick={handleEditNameClick}
              style={{ cursor: "pointer", marginLeft: "5px" }}
            />
          </>
        )}
      </label>
      <div
        className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 mb-4 border-b-2 self-center p-4 text-xl"
        dir="rtl"
      >
        {navs.map((nav, index) => (
          <div
            key={index}
            className={`nav-item ${
              activeNav === nav ? "active" : ""
            } min-w-[40px] text-center transition-all ease-in-out duration-500`}
            onClick={() => handleNavClick(nav)}
          >
            {nav}
          </div>
        ))}
      </div>
      <div className="offline_content w-full">
        {activeNav === "غزلیں" && <Ghazlen />}
        {activeNav === "نظمیں" && <Nazmen />}
        {activeNav === "اشعار" && <Ashaar />}
        {activeNav === "شعرا" && <Shura />}
        {activeNav === "ئی-بکس" && <EBooks />}
      </div>
    </div>
  );
};

export default YourPage;
