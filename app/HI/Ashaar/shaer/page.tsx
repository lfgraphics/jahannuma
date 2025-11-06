import Link from "next/link";

export default function ShaerIndexPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">कवि - अशआर</h1>
      <div className="text-center">
        <p className="text-lg mb-4">विशिष्ट कवियों की कविताएं ब्राउज़ करें</p>
        <Link 
          href="/HI/Ashaar" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← अशआर पर वापस जाएं
        </Link>
      </div>
    </div>
  );
}