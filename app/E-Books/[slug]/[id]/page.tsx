"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SkeletonLoader from "../../../Components/SkeletonLoader";
// aos for cards animation
import { Button } from "@/components/ui/button";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useAirtableRecord } from "@/hooks/useAirtableRecord";
import useAuthGuard from "@/hooks/useAuthGuard";
import { TTL } from "@/lib/airtable-fetcher";
import AOS from "aos";
import "aos/dist/aos.css";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

// Dynamically import PdfViewer on the client only to avoid SSR/window issues
const PdfViewer = dynamic(() => import("@/app/Components/PdfViewer"), {
  ssr: false,
});

interface AirtableAttachment {
  height: number;
  url: string;
  width: number;
  thumbnails?: {
    large?: { height: number; url: string; width: number };
    small?: { height: number; url: string; width: number };
    full?: { height: number; url: string; width: number };
  };
}

interface BookRecordFields {
  bookName: string;
  publishingDate: string;
  writer: string;
  desc: string;
  maloomat?: string;
  download?: boolean;
  book: AirtableAttachment[];
}

export default function Page() {
  const [bookUrl, setBookUrl] = useState<string | undefined>(undefined);
  const [bookKey, setBookKey] = useState<number | undefined>(undefined);
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } =
    useAuthGuard();

  // use unified single-record hook when we have a stable recordId
  const {
    data: record,
    isLoading,
    error,
  } = useAirtableRecord<{ fields: BookRecordFields }>(
    "appXcBoNMGdIaSUyA",
    "E-Books",
    id,
    { ttl: TTL.fast }
  );

  useEffect(() => {
    AOS.init({
      offset: 50,
      delay: 0,
      duration: 300,
    });
  }, []);

  // Intercept console.error on the client and show sonner toast when WebViewer version mismatch occurs
  useEffect(() => {
    // run only in browser
    if (typeof window === "undefined") return;

    const originalConsoleError = console.error.bind(console);

    (console as any).error = (...args: any[]) => {
      try {
        // Always call original to preserve behavior
        originalConsoleError(...args);
      } catch {
        // ignore if original throws
      }

      try {
        // Flatten arguments into a string so we can match messages
        const text = args
          .map((a: any) => {
            if (typeof a === "string") return a;
            try {
              return JSON.stringify(a);
            } catch {
              return String(a);
            }
          })
          .join(" ");

        if (/WebViewer\]\s*Version\s*Mismatch/i.test(text)) {
          // Show a user-friendly toast describing the problem
          toast.error(
            "WebViewer version mismatch detected: please update core/UI to matching version (see console)."
          );
        }
      } catch {
        // ignore matching errors
      }
    };

    return () => {
      // restore original on cleanup
      try {
        (console as any).error = originalConsoleError;
      } catch {
        // ignore restore errors
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // no manual fetch; data provided by hook

  useEffect(() => {
    const fields = record?.fields;
    if (fields?.book && fields.book.length > 0) {
      const firstBook = fields.book[0];
      const url = firstBook.url;
      setBookUrl(url);
    } else if (fields) {
      console.error(
        "No book data found in the record. please contact the organization"
      );
    }
  }, [record]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div dir="rtl" className="flex flex-col min-h-screen w-screen">
      {isLoading && <SkeletonLoader />}
      {!isLoading && (
        <div className="relative">
          <div className="flex flex-col sm:flex-row p-6 pb-0">
            <Link href="#pdf">
              <div className="photo mb-4">
                <img
                  className="h-full w-[50%] p-2 border-2 block mx-auto"
                  src={`${record?.fields?.book?.[0]?.thumbnails?.large?.url ?? ""
                    }`}
                  height={record?.fields?.book?.[0]?.thumbnails?.large?.height}
                  width={record?.fields?.book?.[0]?.thumbnails?.large?.width}
                  alt="Book cover"
                  loading="lazy"
                />
              </div>
            </Link>
            <div className="details" data-aos="fade-up">
              {record?.fields ? (
                <div className="text-lg" data-aos="fade-up">
                  <p className="my-2">
                    کتاب کا نام:{" "}
                    <span className="text-primary">
                      {record.fields.bookName}
                    </span>
                  </p>
                  <p className="my-2">
                    اشاعت:{" "}
                    {formatDate(record?.fields?.publishingDate).split("/")[2] ||
                      formatDate(record?.fields?.publishingDate).split(
                        "/"
                      )[0] ||
                      record?.fields?.publishingDate}
                  </p>
                  <p className="my-2">
                    مصنف:
                    <Link href={`/Shaer/${record.fields.writer}`}>
                      {record.fields.writer}
                    </Link>
                  </p>
                  <p className="my-2">تفصیل: {record.fields.desc}</p>
                  {record.fields.maloomat && (
                    <div className="bg-muted py-2 mt-4 rounded-sm border">
                      <p className="text-xs mr-4 text-foreground">
                        دلچسپ معلومات:
                      </p>
                      <p className="maloomat mr-4 mt-2 text-sm">
                        {record.fields.maloomat}
                      </p>
                    </div>
                  )}
                  <div className="scale-75">
                    <Link
                      href={`#pdf`}
                      className=" text-background block mx-auto m-4 p-2 bg-blue-500 text-center w-[200px] px-8 rounded-md"
                    >
                      کتاب پڑھیں
                    </Link>
                    {bookUrl && record.fields.download && (
                      <Link
                        href={bookUrl}
                        onClick={(e) => {
                          // Enforce auth on download
                          if (!requireAuth("download")) {
                            e.preventDefault();
                          }
                        }}
                        className=" text-foreground block mx-auto m-4 mb-1 p-2 border-2 border-blue-500 text-center w-[200px] px-8 rounded-md"
                      >
                        کتاب ڈاؤنلوڈ کریں
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="text-center text-sm text-muted-foreground"
                  data-aos="fade-up"
                >
                  ریکارڈ دستیاب نہیں ہے
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => setBookKey(Math.random() + 1)}>
            <RefreshCwIcon
              className="sticky top-[95px] right-3"
            />
            رفرش
          </Button>
          <div id="pdf" className="p-4" key={bookKey}>
            {bookUrl && <PdfViewer url={bookUrl} />}
          </div>
        </div>
      )}
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        actionType={pendingAction || "download"}
      />
    </div>
  );
}
