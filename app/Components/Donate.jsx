"use client";
import { PayPalButton } from "react-paypal-button-v2";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Donate = () => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [inputInFocus, setInputInFocus] = useState(false);

  const addPaypalScript = () => {
    console.log("adding paypal script");
    if (window.paypal) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://www.paypal.com/sdk/js?client-id=ATtdrMZ28So6sHSQrAs3aD5Ix9GoAAxsZJd0wl6qjmlIM2j58a48ClY0rmk3pP7Pkx_d4HmFYFOAlNL_";
    console.log("created paypal script");
    script.type = "text/javascript"; // Corrected the type
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    console.log("appended paypal script");
  };

  useEffect(() => {
    addPaypalScript();
  }, []);

  const [amount, setAmount] = useState(50);
  const [usdAmount, setUsdAmount] = useState(15);
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    // Replace 'YOUR_API_KEY' with the actual API key from ExchangeRate-API
    // const apiKey = "YOUR_API_KEY";
    const apiUrl = `https://open.er-api.com/v6/latest/INR`;

    axios
      .get(apiUrl)
      .then((response) => {
        const rate = response.data.rates.USD;
        setExchangeRate(rate);
        setUsdAmount(amount * rate);
      })
      .catch((error) => {
        console.error("Error fetching exchange rate:", error);
      });
  }, [amount]);

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setUsdAmount(selectedAmount * exchangeRate);
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
              value={inputInFocus ? amount : ""}
              onClick={() => setInputInFocus(true)}
              onChange={(e) => handleAmountSelect(Number(e.target.value))}
            />
          </div>
        </div>
        <p dir="rtl">ہندوستانی روپیہ : {(amount / exchangeRate).toFixed(2)}</p>
      </div>
      {scriptLoaded ? (
        <PayPalButton
          amount={amount}
          onSuccess={(details, data) => {
            alert("Transaction completed by " + details.payer.name.given_name);

            // OPTIONAL: Call your server to save the transaction
            return fetch("/paypal-transaction-complete", {
              method: "post",
              body: JSON.stringify({
                orderID: data.orderID,
              }),
            });
          }}
        />
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
{
  /* <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID"></script>; */
}
// ATtdrMZ28So6sHSQrAs3aD5Ix9GoAAxsZJd0wl6qjmlIM2j58a48ClY0rmk3pP7Pkx_d4HmFYFOAlNL_
