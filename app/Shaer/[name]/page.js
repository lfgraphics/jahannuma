import React from 'react';

const page = ({ params }) => {
  const encodedName = params.name; // Extract the 'name' property from 'params'

  // Decode the URL-encoded name
  const decodedName = decodeURIComponent(encodedName);

  return (
    <div>
      <h1>This is dynamic data of: {decodedName.replace('-'," ")}</h1>
      we'll fetch from server soon
    </div>
  );
};

export default page;
