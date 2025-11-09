import React from "react";

const Loader = () => {
  return (
    <div className="grid w-full h-[220px] max-h-screen items-center bg-opacity-50 bg-background">
      <div className="w-full h-[220px]  max-h-screen flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Logo"
          height={100}
          width={100}
          className="animate-pulse block"
        ></img>
      </div>
    </div>
  );
};

export default Loader;
