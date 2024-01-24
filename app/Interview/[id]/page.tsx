const page = ({ params }: { params: { id: string } }) => {
  return (
    <div className="w-screen pt-12 px-5 ">
      <iframe
        className="w-full mb-12 h-screen aspect-auto rounded-lg overflow-hidden"
        width="380"
        height="215"
        src={`https://www.youtube.com/embed/${params.id}`}
        frameBorder="0"
        allow="picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default page;
