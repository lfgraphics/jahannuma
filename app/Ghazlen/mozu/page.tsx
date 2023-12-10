"use client";
// import Commingsoon from "@/app/Components/Commingsoon";
import Loader from "@/app/Components/Loader";
import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    // This code will run when the component mounts
    window.history.back();
  }, []); // The empty dependency array ensures that this effect runs only once, similar to componentDidMount

  return (
    <div className="w-screen h-[90vh] flex justify-center items-center">
      <Loader />
    </div>
  );
};

export default Page;
