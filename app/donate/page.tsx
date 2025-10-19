import { Button } from "@/components/ui/button";
import Link from "next/link";
import CopyButton from "./CopyButton";

// metadata for donation page
export const metadata = {
  title: "Donate",
  description: "Donate to Jahan Numa Foundation and support our mission.",
};


const page = () => {
  const textToCopy = `Account Holder Name: JAHANUMA ADBI SOCIETY` + `\n` +
    `Account Number: 12036382809` + `\n` +
    `IFSC Code: CNRB0002917` + `\n` +
    `Bank and Branch: Canara Bank, Sahebganj`;

  return (
    <div className="flex flex-col items-center justify-center md:items-start md:flex-row gap-4 p-6">
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <span className="border-b "><strong>Account Holder Name:</strong></span>
        <span className="border-b ">JAHANUMA ADBI SOCIETY</span>

        <span className="border-b "><strong>Account Number:</strong></span>
        <span className="border-b ">12036382809</span>

        <span className="border-b "><strong>IFSC Code:</strong></span>
        <span className="border-b ">CNRB0002917</span>

        <span className="border-b "><strong>Bank and Branch:</strong></span>
        <span className="border-b ">Canara Bank, Sahebganj</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="qr">
          <img width={300} height={300} src="/donation/qr.jpg" alt="QR code for donation" />
        </div>
        <div className="buttons flex m-2 px-2 w-full items-center justify-between">
          <Link href="/donation/qr.jpg" download="qr.jpg">
            <Button>Download QR</Button>
          </Link>
          <CopyButton textToCopy={textToCopy} />
        </div>
      </div>
    </div>
  );
};

export default page;
