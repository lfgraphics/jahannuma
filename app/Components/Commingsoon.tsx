"use client"
import { backgroundPosition } from "html2canvas/dist/types/css/property-descriptors/background-position";
import { backgroundRepeat } from "html2canvas/dist/types/css/property-descriptors/background-repeat";
import React, { useEffect } from "react";

const Commingsoon = () => {
  useEffect(() => {
    // Set the date we're counting down to
    var countDownDate = new Date("Feb 1, 2024 00:00:00").getTime();

    // Update the countdown every 1 second
    var x = setInterval(function () {
      // Get today's date and time
      var now = new Date().getTime();

      // Find the distance between now and the count down date
      var distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the corresponding elements
      document!.getElementById("days")!.textContent = days + "d";
      document!.getElementById("hours")!.textContent = hours + "h";
      document!.getElementById("minutes")!.textContent = minutes + "m";
      document!.getElementById("seconds")!.textContent = seconds + "s";

      // If the count down is over, write some text
      if (distance < 0) {
        clearInterval(x);
        document!.getElementById("countdown")!.innerHTML = "EXPIRED";
      }
    }, 1000);
  }, []);
  return (
    <div>
      <div
        className="h-screen flex justify-center items-center px-2"
        style={{
          background: "url(/bg.jpeg)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "cover", // or "contain" depending on your preference
          backgroundPosition: "center",
          backgroundAttachment: "fixed", // or "scroll" depending on your preference
        }}
      >
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="py-4 px-6">
            <h2 className="text-4xl font-bold text-gray-800">Coming Soon</h2>
            <p className="mt-2 text-lg text-gray-600">
              We are working hard to bring you an amazing website. Stay tuned!
            </p>
          </div>

          <div className="py-4 px-6">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="border rounded-lg px-4 py-2">
                <div
                  id="days"
                  className="font-bold font-mono text-2xl text-gray-800"
                ></div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div
                  id="hours"
                  className="font-bold font-mono text-2xl text-gray-800"
                ></div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div
                  id="minutes"
                  className="font-bold font-mono text-2xl text-gray-800"
                ></div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div
                  id="seconds"
                  className="font-bold font-mono text-2xl text-gray-800"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Commingsoon;
