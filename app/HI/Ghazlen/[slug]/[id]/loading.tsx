import Loader from "@/app/Components/Loader";

export default function Loading() {
  return (
    <div className="h-[90vh] w-full flex items-center justify-center">
      <Loader />
    </div>
  );
}