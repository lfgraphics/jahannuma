"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import SkeletonLoader from "../../Components/SkeletonLoader";
// aos for cards animation
import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "sonner";

// Dynamically import PdfViewer on the client only to avoid SSR/window issues
const PdfViewer = dynamic(() => import("@/app/Components/PdfViewer"), { ssr: false });

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
    const [data, setData] = useState<BookRecordFields | null>(null);
    const [bookUrl, setBookUrl] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const params = useParams<{ id: string }>();

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

    const id = params?.id;

    const fetchData = async () => {
        setLoading(true);
        try {
            const BASE_ID = "appXcBoNMGdIaSUyA";
            const TABLE_NAME = "E-Books";
            const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=({id}='${id}')`;
            const token = process.env.NEXT_PUBLIC_Api_Token;
            const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
            const init: RequestInit = { method: "GET" };
            if (Object.keys(headers).length > 0) {
                init.headers = headers;
            }

            const response = await fetch(url, init);
            const result = await response.json();

            const records = result.records || [];
            if (records.length > 0) {
                const fieldsData = records[0].fields as BookRecordFields;
                setData(fieldsData);
            } else {
                console.error("No records found in the response.");
                setData(null);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(`Failed to fetch data: ${error}`);
            toast.error("Failed to load book data. Check console for details.");
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (data?.book && data.book.length > 0) {
            const firstBook = data.book[0];
            const url = firstBook.url;
            setBookUrl(url);
        } else if (data) {
            console.error("No book data found in the record. please contact the organization");
        }
    }, [data]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    return (
        <div dir="rtl" className="flex flex-col min-h-screen w-screen">
            {loading && <SkeletonLoader />}
            {!loading && (
                <>
                    <div className="flex flex-col sm:flex-row p-6">
                        <Link href="#pdf">
                            <div className="photo mb-4">
                                <img
                                    className="h-full w-[50%] p-2 border-2 block mx-auto"
                                    src={`${data?.book?.[0]?.thumbnails?.large?.url ?? ""}`}
                                    height={data?.book?.[0]?.thumbnails?.large?.height}
                                    width={data?.book?.[0]?.thumbnails?.large?.width}
                                    alt="Book cover"
                                    loading="lazy"
                                />
                            </div>
                        </Link>
                        <div className="details" data-aos="fade-up">
                            {data ? (
                                <div className="text-lg" data-aos="fade-up">
                                    <p className="my-2">کتاب کا نام: {data.bookName}</p>
                                    <p className="my-2">اشاعت: {formatDate(data.publishingDate)}</p>
                                    <p className="my-2">
                                        مصنف:
                                        <Link href={`/Shaer/${data.writer}`}>{data.writer}</Link>
                                    </p>
                                    <p className="my-2">تفصیل: {data.desc}</p>
                                    {data.maloomat && (
                                        <div className="bg-gray-100 py-2 mt-4 rounded-sm border">
                                            <p className="text-xs mr-4 text-foreground">دلچسپ معلومات:</p>
                                            <p className="maloomat mr-4 mt-2 text-sm">{data.maloomat}</p>
                                        </div>
                                    )}
                                    <div className="scale-75">
                                        <Link href={`#pdf`} className=" text-background block mx-auto m-4 p-2 bg-blue-500 text-center w-[200px] px-8 rounded-md">
                                            کتاب پڑھیں
                                        </Link>
                                        {bookUrl && data.download && (
                                            <Link href={bookUrl} className=" text-foreground block mx-auto m-4 mb-1 p-2 border-2 border-blue-500 text-center w-[200px] px-8 rounded-md">
                                                کتاب ڈاؤنلوڈ کریں
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground" data-aos="fade-up">
                                    ریکارڈ دستیاب نہیں ہے
                                </div>
                            )}
                        </div>
                    </div>
                    <div id="pdf" className="p-4">
                        {bookUrl && <PdfViewer url={bookUrl} />}
                    </div>
                </>
            )}
        </div>
    );
}
