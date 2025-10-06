"use client";

import React, { useEffect, useMemo } from "react";
import { SignedIn, useUser } from "@clerk/nextjs";
import DataCard from "@/app/Components/DataCard";
import Card from "@/app/Components/BookCard";
import { useAirtableList } from "@/hooks/useAirtableList";
import type { AirtableRecord, AshaarRecord, GhazlenRecord, NazmenRecord } from "@/app/types";
import { useShareAction } from "@/hooks/useShareAction";
import { formatAshaarRecord, formatGhazlenRecord, formatNazmenRecord } from "@/lib/airtable-utils";

// Airtable base/table constants
const ASHAAR_BASE = "appeI2xzzyvUN5bR7";
const ASHAAR_TABLE = "Ashaar";
const GHAZLEN_BASE = "appvzkf6nX376pZy6";
const GHAZLEN_TABLE = "Ghazlen";
const NAZMEN_BASE = "app5Y2OsuDgpXeQdz";
const NAZMEN_TABLE = "nazmen";
const BOOKS_BASE = "appXcBoNMGdIaSUyA";
const BOOKS_TABLE = "E-Books";

function buildIdsFilter(ids: string[] | undefined): string | undefined {
	if (!ids || ids.length === 0) return undefined;
	const esc = (s: string) => String(s).replace(/'/g, "''");
	const parts = ids.map((id) => `(RECORD_ID() = '${esc(id)}')`);
	return `OR(${parts.join(",")})`;
}

export default function FavoritesPage() {
	const { user, isLoaded } = useUser();
	const likes = (user?.publicMetadata as any)?.likes || {};

	const ashaarIds: string[] = Array.isArray(likes?.ashaar) ? likes.ashaar : [];
	const ghazlenIds: string[] = Array.isArray(likes?.ghazlen) ? likes.ghazlen : [];
	const nazmenIds: string[] = Array.isArray(likes?.nazmen) ? likes.nazmen : [];
	const bookIds: string[] = Array.isArray(likes?.books) ? likes.books : [];

	const ashaarFilter = useMemo(() => buildIdsFilter(ashaarIds), [ashaarIds.join("|")]);
	const ghazlenFilter = useMemo(() => buildIdsFilter(ghazlenIds), [ghazlenIds.join("|")]);
	const nazmenFilter = useMemo(() => buildIdsFilter(nazmenIds), [nazmenIds.join("|")]);
	const booksFilter = useMemo(() => buildIdsFilter(bookIds), [bookIds.join("|")]);

		const {
			records: ashaarRecords,
			isLoading: ashaarLoading,
			swrKey: ashaarSWR,
			mutate: mutateAshaar,
		} = useAirtableList<AirtableRecord<AshaarRecord>>(ASHAAR_BASE, ASHAAR_TABLE, {
		pageSize: Math.max(ashaarIds.length, 1),
		filterByFormula: ashaarFilter,
	}, { enabled: ashaarIds.length > 0 });
	const ashaarItems = useMemo(() => (ashaarRecords || []).map(formatAshaarRecord), [ashaarRecords]);

		const {
			records: ghazlenRecords,
			isLoading: ghazlenLoading,
			swrKey: ghazlenSWR,
			mutate: mutateGhazlen,
		} = useAirtableList<AirtableRecord<GhazlenRecord>>(GHAZLEN_BASE, GHAZLEN_TABLE, {
		pageSize: Math.max(ghazlenIds.length, 1),
		filterByFormula: ghazlenFilter,
	}, { enabled: ghazlenIds.length > 0 });
	const ghazlenItems = useMemo(() => (ghazlenRecords || []).map(formatGhazlenRecord), [ghazlenRecords]);

		const {
			records: nazmenRecords,
			isLoading: nazmenLoading,
			swrKey: nazmenSWR,
			mutate: mutateNazmen,
		} = useAirtableList<AirtableRecord<NazmenRecord>>(NAZMEN_BASE, NAZMEN_TABLE, {
		pageSize: Math.max(nazmenIds.length, 1),
		filterByFormula: nazmenFilter,
	}, { enabled: nazmenIds.length > 0 });
	const nazmenItems = useMemo(() => (nazmenRecords || []).map(formatNazmenRecord), [nazmenRecords]);

	// Books: we only render cards; like/share handled by component
		const {
			records: bookRecords,
			isLoading: booksLoading,
			swrKey: booksSWR,
			mutate: mutateBooks,
		} = useAirtableList<any>(BOOKS_BASE, BOOKS_TABLE, {
		pageSize: Math.max(bookIds.length, 1),
		filterByFormula: booksFilter,
	}, { enabled: bookIds.length > 0 });

	// Share handlers per section to ensure correct auth gating and dialogs
	const shareAshaar = useShareAction({ section: "Ashaar", title: "" });
	const shareGhazlen = useShareAction({ section: "Ghazlen", title: "" });
	const shareNazmen = useShareAction({ section: "Nazmen", title: "" });

	const nothingToShow =
		(ashaarIds.length + ghazlenIds.length + nazmenIds.length + bookIds.length) === 0;

		// Refresh lists when global likes change to reflect Clerk metadata updates immediately
		useEffect(() => {
			const onLikesUpdated = () => {
				try { if (ashaarIds.length) mutateAshaar?.(); } catch {}
				try { if (ghazlenIds.length) mutateGhazlen?.(); } catch {}
				try { if (nazmenIds.length) mutateNazmen?.(); } catch {}
				try { if (bookIds.length) mutateBooks?.(); } catch {}
			};
			document.addEventListener("likes-updated", onLikesUpdated as any);
			return () => document.removeEventListener("likes-updated", onLikesUpdated as any);
		}, [ashaarIds.length, ghazlenIds.length, nazmenIds.length, bookIds.length, mutateAshaar, mutateGhazlen, mutateNazmen, mutateBooks]);

	return (
		<div className="container mx-auto p-4" dir="rtl">
			{!isLoaded && <div className="text-center text-muted-foreground">Loading…</div>}
			{isLoaded && nothingToShow && (
				<div className="text-center text-muted-foreground">ابھی کوئی پسندیدہ مواد موجود نہیں ہے۔</div>
			)}

			{ashaarIds.length > 0 && (
				<section className="mb-6">
					<h2 className="text-xl font-semibold mb-3">اشعار</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{!ashaarLoading && ashaarItems.map((rec, index) => (
							<DataCard
								key={rec.id}
								page="rand"
								shaerData={rec as any}
								index={index}
								download={false}
								baseId={ASHAAR_BASE}
								table={ASHAAR_TABLE}
								storageKey="Ashaar"
								swrKey={ashaarSWR}
								toggleanaween={() => {}}
								openanaween={null}
								handleCardClick={() => {}}
								handleShareClick={(r: any) => shareAshaar.handleShare({
									baseId: ASHAAR_BASE,
									table: ASHAAR_TABLE,
									recordId: (r as AirtableRecord<AshaarRecord>).id,
									title: (r as AirtableRecord<AshaarRecord>).fields.shaer,
									textLines: (r as AirtableRecord<AshaarRecord>).fields.ghazalHead || [],
									slugId: (r as AirtableRecord<AshaarRecord>).fields.slugId,
									swrKey: ashaarSWR,
									currentShares: (r as AirtableRecord<AshaarRecord>).fields.shares ?? 0,
								})}
								openComments={() => {}}
							/>
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{ghazlenIds.length > 0 && (
				<section className="mb-6">
					<h2 className="text-xl font-semibold mb-3">غزلیں</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{!ghazlenLoading && ghazlenItems.map((rec, index) => (
							<DataCard
								key={rec.id}
								page="ghazal"
								shaerData={rec as any}
								index={index}
								download={false}
								baseId={GHAZLEN_BASE}
								table={GHAZLEN_TABLE}
								storageKey="Ghazlen"
								swrKey={ghazlenSWR}
								toggleanaween={() => {}}
								openanaween={null}
								handleCardClick={() => {}}
								handleShareClick={(r: any) => shareGhazlen.handleShare({
									baseId: GHAZLEN_BASE,
									table: GHAZLEN_TABLE,
									recordId: (r as AirtableRecord<GhazlenRecord>).id,
									title: (r as AirtableRecord<GhazlenRecord>).fields.shaer,
									textLines: Array.isArray((r as AirtableRecord<GhazlenRecord>).fields.ghazalHead) ? (r as AirtableRecord<GhazlenRecord>).fields.ghazalHead as any : String((r as AirtableRecord<GhazlenRecord>).fields.ghazalHead || "").split("\n"),
									slugId: (r as AirtableRecord<GhazlenRecord>).fields.slugId,
									swrKey: ghazlenSWR,
									currentShares: (r as AirtableRecord<GhazlenRecord>).fields.shares ?? 0,
								})}
								openComments={() => {}}
							/>
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{nazmenIds.length > 0 && (
				<section className="mb-6">
					<h2 className="text-xl font-semibold mb-3">نظمیں</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{!nazmenLoading && nazmenItems.map((rec, index) => (
							<DataCard
								key={rec.id}
								page="nazm"
								shaerData={rec as any}
								index={index}
								download={false}
								baseId={NAZMEN_BASE}
								table={NAZMEN_TABLE}
								storageKey="Nazmen"
								swrKey={nazmenSWR}
								toggleanaween={() => {}}
								openanaween={null}
								handleCardClick={() => {}}
								handleShareClick={(r: any) => {
									const rr = r as AirtableRecord<NazmenRecord>;
									const lines = Array.isArray(rr.fields.ghazalLines) ? rr.fields.ghazalLines : String(rr.fields.nazm || "").split("\n");
									return shareNazmen.handleShare({
										baseId: NAZMEN_BASE,
										table: NAZMEN_TABLE,
										recordId: rr.id,
										title: rr.fields.shaer,
										textLines: lines,
										slugId: rr.fields.slugId,
										swrKey: nazmenSWR,
										currentShares: rr.fields.shares ?? 0,
									});
								}}
								openComments={() => {}}
							/>
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{bookIds.length > 0 && (
							<section className="mb-6">
					<h2 className="text-xl font-semibold mb-3">کتابیں</h2>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{!booksLoading && (bookRecords || []).map((rec: any) => (
							<Card key={rec.id} data={rec} showLikeButton baseId={BOOKS_BASE} table={BOOKS_TABLE} storageKey="Books" swrKey={booksSWR} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
