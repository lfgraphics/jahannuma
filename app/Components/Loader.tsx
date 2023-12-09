import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="grid w-screen h-[220px] max-h-screen items-center bg-opacity-50 bg-white">
      <div className="w-100vw h-[220px]  max-h-screen flex items-center justify-center">
        <Image
          src="/logo.png" // Replace with your logo file path
          alt="Logo"
          height={100}
          width={100}
          className="animate-pulse block"
        />
      </div>
    </div>
  );
};

export default Loader;
