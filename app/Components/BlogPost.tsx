
// import { ReactNode } from "react";

interface BlogPostProps {
  content: string;
}

const BlogPost: React.FC<BlogPostProps> = ({ content }) => {
  return (
    <div>
      {/* Render the parsed HTML content */}
      <div
        className="w-max h-max block mx-auto"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Add other components or UI elements as needed */}
    </div>
  );
};

export default BlogPost;
