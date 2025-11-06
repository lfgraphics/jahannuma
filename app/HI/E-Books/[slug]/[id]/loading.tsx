import SkeletonLoader from "../../../../Components/SkeletonLoader";

export default function Loading() {
  return (
    <div dir="ltr" className="flex flex-col min-h-screen w-screen">
      <SkeletonLoader />
    </div>
  );
}