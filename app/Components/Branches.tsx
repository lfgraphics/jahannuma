"use-client";
import Link from "next/link";
import React from "react";

const Branches = () => {
  return (
    <div>
      <div className=" bg-gray-100 h-[540px]">
        <div className="pt-7 text-2xl text-center text-gray-700">
          جہاں نما کی شاخیں
        </div>
        <div className=" p-4 w-full overflow-x-auto">
          <div className="flex flex-row w-max">
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[350px] m-3 shadow-md relative text-center">
              <Link href="/bazmeurdu">
                <img
                  src="/branches/urdu.jpeg"
                  alt="Bazme urdu Image"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                ></img>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بزم اردو</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[350px] m-3 shadow-md relative text-center">
              <Link href="/bazmehindi">
                <img
                  src="/branches/hindi.jpeg"
                  alt="Bazme hindi Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></img>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بزم ھندی</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[350px] m-3 shadow-md relative text-center">
              <Link href="/Blogs">
                <img
                  src="/branches/blog.jpeg"
                  alt="blogs Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></img>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بلاگز</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[350px] m-3 shadow-md relative text-center">
              <Link href="/Interview">
                <img
                  src="/branches/interviews.jpeg"
                  alt="interview Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></img>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>انٹرویو</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Branches;
