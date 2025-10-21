import { Button } from "@/components/ui/button";
import Link from "next/link";
import CopyButton from "./CopyButton";

export const metadata = {
  title: "दान करें | जहाननुमा - उर्दू साहित्य का समर्थन करें",
  description: "उर्दू साहित्य और कविता के संरक्षण और प्रचार के जहाननुमा के मिशन का समर्थन करें। आपका दान हमें इस डिजिटल पुस्तकालय और सांस्कृतिक विरासत को भावी पीढ़ियों के लिए बनाए रखने में मदद करता है।",
};

export default function Donate() {
  const textToCopy = `खाता धारक का नाम: JAHANUMA ADBI SOCIETY` + `\n` +
    `खाता संख्या: 12036382809` + `\n` +
    `IFSC कोड: CNRB0002917` + `\n` +
    `बैंक और शाखा: Canara Bank, Sahebganj`;

  return (
    <div className="flex flex-col items-center justify-center md:items-start md:flex-row gap-4 p-6">
      <div className="grid grid-cols-[auto_1fr] gap-x-2">
        <span className="border-b "><strong>खाता धारक का नाम:</strong></span>
        <span className="border-b ">JAHANUMA ADBI SOCIETY</span>

        <span className="border-b "><strong>खाता संख्या:</strong></span>
        <span className="border-b ">12036382809</span>

        <span className="border-b "><strong>IFSC कोड:</strong></span>
        <span className="border-b ">CNRB0002917</span>

        <span className="border-b "><strong>बैंक और शाखा:</strong></span>
        <span className="border-b ">Canara Bank, Sahebganj</span>

        <span className="border-b "><strong>UPI ID:</strong></span>
        <span className="border-b ">334077001382809@cnrb</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="qr">
          <img width={300} height={300} src="/donation/qr.jpg" alt="दान के लिए QR कोड" />
        </div>
        <div className="buttons flex m-2 px-2 w-full items-center justify-between">
          <Link href="/donation/qr.jpg" download="qr.jpg">
            <Button>QR डाउनलोड करें</Button>
          </Link>
          <CopyButton textToCopy={textToCopy} />
        </div>
      </div>
    </div>
  );
}
