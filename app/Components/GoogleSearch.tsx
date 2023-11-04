"use client"
import Script from "next/script";

function GoogleSearch() {

  return (
    <div>
      <Script
        async
        src="https://cse.google.com/cse.js?cx=70539644082ff4a06"
        strategy="afterInteractive"
      />
      <div dir="ltr" className="gcse-search"></div>
    </div>
  );
}

export default GoogleSearch;
