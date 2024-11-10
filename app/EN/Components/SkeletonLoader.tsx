import React from 'react'

const SkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            role="status"
            className="flex items-center justify-center h-56 w-[350px] max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"
          ></div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonLoader
