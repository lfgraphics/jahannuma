"use client";
import React from "react";
import { SWRConfig } from "swr";
import { airtableSWRFetcher } from "@/lib/airtable-fetcher";

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher: airtableSWRFetcher as any,
                dedupingInterval: 60_000,
                revalidateOnFocus: false,
                revalidateOnReconnect: true,
                refreshInterval: 0,
                onError: (err) => {
                    if (process.env.NODE_ENV !== "production") {
                        // eslint-disable-next-line no-console
                        console.error("SWR error:", err);
                    }
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}

export default SWRProvider;
