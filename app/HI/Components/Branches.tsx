"use-client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Branches = () => {
  return (
    <div>
      <div className=" bg-gray-100 h-[620px]">
        <p className="pt-7 text-xl font-semibold text-center text-[#984A02] tracking-[5px] pb-[13px]">
          Jahannuma Branches
        </p>
        <div className=" p-4 w-screen overflow-x-auto">
          <div className="flex flex-row w-max">
            <div className="rounded-lg overflow-hidden border-2 border-[#F0D586] w-[300px] h-[max-content] m-3">
              <Link href="/bazmeurdu">
                <Image
                  src="/branches/urdu.jpeg"
                  alt="Bazme urdu Image"
                  width="100"
                  height="400"
                  className="w-full h-auto"
                ></Image>
                <div className="relative bottom-0 text-center bg-[#F0D586] text-[#984A02] text-xl font-semibold pb-[11px]">
                  <p>Bazm-e-Urdu</p>
                </div>
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden border-2 border-[#F0D586] w-[300px] h-[max-content] m-3">
              <Link href="/bazmehindi">
                <Image
                  src="/branches/hindi.jpeg"
                  alt="Bazme hindi Image"
                  width="100"
                  height="400"
                  className="w-full h-auto"
                ></Image>
                <div className="relative bottom-0 text-center bg-[#F0D586] text-[#984A02] text-xl font-semibold pb-[11px]">
                  <p>Bazm-e-Hindi</p>
                </div>
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden border-2 border-[#F0D586] w-[300px] h-[max-content] m-3">
              <Link href="/blogs">
                <Image
                  src="/branches/blog.jpeg"
                  alt="blogs Image"
                  width="100"
                  height="400"
                  className="w-full h-auto"
                ></Image>
                <div className="relative bottom-0 text-center bg-[#F0D586] text-[#984A02] text-xl font-semibold pb-[11px]">
                  <p>Blogs</p>
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
