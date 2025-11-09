"use client";
import { useEffect, useRef, useState } from "react";

interface Prop {
  url: string;
}

const PdfViewer: React.FC<Prop> = ({ url }) => {
  const viewer = useRef(null);
  const [oneInstanceCreated, setOneInstanceCreated] = useState<boolean>(false);

  useEffect(() => {
    let canceled = false;
    if (typeof window !== "undefined" && !oneInstanceCreated) {
      setOneInstanceCreated(true);
      import("@pdftron/webviewer").then((mod) => {
        if (canceled) return;
        const WebViewer = mod.default;
        const viewerElement = viewer.current as unknown as HTMLDivElement | null;
        if (!viewerElement) return;
        const options = {
          path: "/pdfViewer",
          licenseKey: process.env.NEXT_PUBLIC_PDFViewer_Key as string | undefined,
          initialDoc: url,
        } as const;

        WebViewer(options as any, viewerElement).then((instance: any) => {
          try {
            const { UI } = instance;
            UI?.disableElements?.(["header"]);
          } catch {}
        });
      });
    }
    return () => {
      canceled = true;
    };
  }, [oneInstanceCreated, url]);

  return (
    <div className="MyComponent">
      <div className="webviewer" ref={viewer} style={{ height: "70vh" }}></div>
    </div>
  );
};

export default PdfViewer;
