"use client"
import { useEffect, useState } from "react";

const ComingSoon: React.FC = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const countDownDate = new Date("Feb 1, 2024 00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });

      if (distance < 0) {
        clearInterval(interval);
      }
    };

    // Update the countdown every 1 second
    const interval = setInterval(updateCountdown, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div
        className="h-screen flex justify-center items-center px-2"
        style={{
          background: "url(/bg.jpeg)",
          backgroundRepeat: "repeat-x",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="py-4 px-6">
            <h2 className="text-4xl font-bold text-gray-800">जल्द आ रहा है</h2>
            <p className="mt-2 text-lg text-gray-600">
              हम आपके लिए एक अद्भुत वेबसाइट लाने के लिए कड़ी मेहनत कर रहे हैं। बने रहें!
            </p>
          </div>

          <div className="py-4 px-6">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <div className="border rounded-lg px-4 py-2">
                <div className="font-bold font-mono text-2xl text-gray-800">
                  {countdown.days}d
                </div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div className="font-bold font-mono text-2xl text-gray-800">
                  {countdown.hours}h
                </div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div className="font-bold font-mono text-2xl text-gray-800">
                  {countdown.minutes}m
                </div>
              </div>
              <div className="border rounded-lg px-4 py-2">
                <div className="font-bold font-mono text-2xl text-gray-800">
                  {countdown.seconds}s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;