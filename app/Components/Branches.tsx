"use-client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Branches = () => {
  return (
    <div>
      <div className=" bg-gray-100 h-[540px]">
        <div className="pt-7 text-2xl text-center text-gray-700">
          جہاں نما کی شاخیں
        </div>
        <div className=" p-4 w-screen overflow-x-auto">
          <div className="flex flex-row w-max">
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[400px] m-3 shadow-md relative text-center">
              <Link href="/bazmeurdu">
                <Image
                  src="/branches/urdu.jpg"
                  alt="Bazme urdu Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></Image>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بزم اردو</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[400px] m-3 shadow-md relative text-center">
              <Link href="/bazmehindi">
                <Image
                  src="/branches/hindi.jpeg"
                  alt="Bazme hindi Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></Image>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بزم ھندی</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[400px] m-3 shadow-md relative text-center">
              <Link href="/Blogs">
                <Image
                  src="/branches/blog.jpeg"
                  alt="blogs Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></Image>
                <div className="absolute bottom-0 text-center w-full h-16 transition-all duration-500 bg-white text-gray-900 p-4 text-xl ">
                  <p>بلاگز</p>
                </div>
              </Link>
            </div>
            <div className="rounded-md overflow-hidden border-2 w-[300px] h-[400px] m-3 shadow-md relative text-center">
              <Link href="/Interview">
                <Image
                  src="/branches/interviews.jpg"
                  alt="interview Image"
                  width={300}
                  height={450}
                  className="w-full h-auto"
                ></Image>
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
