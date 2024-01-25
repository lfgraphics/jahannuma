"use client";
import WebViewer from "@pdftron/webviewer";
import { useEffect, useRef, useState } from "react";

interface Prop {
  url: string;
}

const PdfViewer: React.FC<Prop> = ({ url }) => {
  const viewer = useRef(null);
  const [oneInstanceCreated, setOneInstanceCreated] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !oneInstanceCreated) {
      setOneInstanceCreated(true);
      import("@pdftron/webviewer").then(() => {
        const viewerElement = viewer.current!; // Non-null assertion
        const options = {
          path: "/pdfViewer",
          licenseKey: `${process.env.NEXT_PUBLIC_PDFViewer_Key}`,
          initialDoc: `${url}`,
        };

        WebViewer(options, viewerElement).then((instance) => {
          // Disable specific UI elements
          const { UI } = instance;
          UI.disableElements(["header"]);
        });
      });
    }
  }, []);

  return (
    <div className="MyComponent">
      <div className="webviewer" ref={viewer} style={{ height: "100vh" }}></div>
    </div>
  );
};

export default PdfViewer;
