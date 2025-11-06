import Link from "next/link";

export default function ShaerIndexPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">कवि - नज़्में</h1>
      <div className="text-center">
        <p className="text-lg mb-4">विशिष्ट कवियों की नज़्में ब्राउज़ करें</p>
        <Link 
          href="/HI/Nazmen" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← नज़्में पर वापस जाएं
        </Link>
      </div>
    </div>
  );
}