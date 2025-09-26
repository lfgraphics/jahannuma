"use client";
import React, { useEffect, useState } from "react";

declare global {
  interface Window { paypal?: any }
}

const Donate: React.FC = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [inputInFocus, setInputInFocus] = useState(false);
  const [amount, setAmount] = useState<number>(50);
  const [usdAmount, setUsdAmount] = useState<number>(15);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const addPaypalScript = () => {
    if (typeof window !== "undefined" && window.paypal) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=ATtdrMZ28So6sHSQrAs3aD5Ix9GoAAxsZJd0wl6qjmlIM2j58a48ClY0rmk3pP7Pkx_d4HmFYFOAlNL_";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  };

  useEffect(() => {
    addPaypalScript();
  }, []);

  useEffect(() => {
    const apiUrl = `https://open.er-api.com/v6/latest/INR`;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((response) => {
        const rate = response?.rates?.USD as number | undefined;
        if (!rate) return;
        setExchangeRate(rate);
        setUsdAmount(amount * rate);
      })
      .catch((error) => {
        console.error("Error fetching exchange rate:", error);
      });
  }, [amount]);

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    if (exchangeRate) setUsdAmount(selectedAmount * exchangeRate);
  };

  return (
    <div className="main w-[450px] h-max border-gray-500 border rounded-md p-5 bg-white">
      <div className="contentWraper text-center m-4">
        <h1 className="head text-black text-2xl mb-2">
          اردو ادب کو بچانے میں ہماری مدد کریں- جہاں نما کو عطیہ کریں۔
        </h1>
        <p className="text-gray-600 text-md mb-3 description">
          جہاں نما اردو شاعری کا دنیا کا سب سے بڑا ذخیرہ ہے۔ یہ ویب سائٹ اردو
          زبان و ادب کے تحفظ اور فروغ کے لیے وقف ہے۔ ابھی عطیہ کریں اور ہمارے
          مقصد کی حمایت کریں۔
        </p>
      </div>
      <div className="rate mb-6 text-center flex flex-col gap-4">
        <p>رقم منتخب کریں</p>
        <div className="flex">
          {[5, 10, 20, 50, 100].map((amountOption) => (
            <button
              key={amountOption}
              className={`mr-2 px-4 py-2 border w-max ${
                amount === amountOption ? "bg-[#9C4901] text-white" : "bg-white"
              }`}
              onClick={() => handleAmountSelect(amountOption)}
            >
              $ {amountOption}
            </button>
          ))}
        </div>
        <div className="flex justify-center items-center">
          <span>$</span>
          <div className="flex items-center">
            <input
              type="number"
              className="ml-2 border p-1"
              placeholder="Other amount"
              value={inputInFocus ? amount : ("" as any)}
              onClick={() => setInputInFocus(true)}
              onChange={(e) => handleAmountSelect(Number(e.target.value))}
            />
          </div>
        </div>
        <p dir="rtl">ہندوستانی روپیہ : {exchangeRate ? (amount / exchangeRate).toFixed(2) : "—"}</p>
      </div>
      {scriptLoaded ? (
        <p>Paypal button isn't working shift the code to Paytm checkout</p>
      ) : (
        <span className="">Loading...</span>
      )}
      {scriptLoaded && (
        <span className="block text-center">
          یا یو پی آئیکے زریععہ عطیہ کریں۔
        </span>
      )}
    </div>
  );
};

export default Donate;
