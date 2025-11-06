import Link from "next/link";

export default function MozuIndexPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">विषय - ग़ज़लें</h1>
      <div className="text-center">
        <p className="text-lg mb-4">विषयों के अनुसार ग़ज़लें ब्राउज़ करें</p>
        <Link 
          href="/HI/Ghazlen" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← ग़ज़लें पर वापस जाएं
        </Link>
      </div>
    </div>
  );
}