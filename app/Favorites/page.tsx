"use client";

import React, { useEffect, useMemo, useState } from "react";
import "./tabs.css";
import { useUser } from "@clerk/nextjs";
import DataCard from "../Components/DataCard";
import Card from "../Components/BookCard";
import ShaerCard from "../Components/shaer/Profilecard";
import RubaiCard from "../Components/RubaiCard";
import { useAirtableList } from "../../hooks/useAirtableList";
import type { AirtableRecord, AshaarRecord, GhazlenRecord, NazmenRecord, Shaer } from "../types";
import { useShareAction } from "../../hooks/useShareAction";
import { formatAshaarRecord, formatGhazlenRecord } from "../../lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";

// Airtable base/table constants
const ASHAAR_BASE = "appeI2xzzyvUN5bR7";
const ASHAAR_TABLE = "Ashaar";
const GHAZLEN_BASE = "appvzkf6nX376pZy6";
const GHAZLEN_TABLE = "Ghazlen";
const NAZMEN_BASE = "app5Y2OsuDgpXeQdz";
const NAZMEN_TABLE = "nazmen";
const BOOKS_BASE = "appXcBoNMGdIaSUyA";
const BOOKS_TABLE = "E-Books";
const SHAER_BASE = "appgWv81tu4RT3uRB";
const SHAER_TABLE = "Intro";
const RUBAI_BASE = "appIewyeCIcAD4Y11";
const RUBAI_TABLE = "rubai";

function buildIdsFilter(ids: string[] | undefined): string | undefined {
	if (!ids || ids.length === 0) return undefined;
	const esc = (s: string) => String(s).replace(/'/g, "''");
	const parts = ids.map((id) => `(RECORD_ID() = '${esc(id)}')`);
	return `OR(${parts.join(",")})`;
}

export default function FavoritesPage() {
	const { language } = useLanguage()
	const { user, isLoaded } = useUser();
	const [likes, setLikes] = React.useState<any>({});
	// Rely on Clerk user.publicMetadata for likes (no manual refresh button or API fetch here)
	useEffect(() => {
		if (!isLoaded || !user?.id) return;
		const l = ((user.publicMetadata as any)?.likes) || {};
		setLikes(l);
	}, [isLoaded, user?.id, user?.publicMetadata]);

	const ashaarIds: string[] = Array.isArray(likes?.ashaar) ? likes.ashaar : [];
	const ghazlenIds: string[] = Array.isArray(likes?.ghazlen) ? likes.ghazlen : [];
	const nazmenIds: string[] = Array.isArray(likes?.nazmen) ? likes.nazmen : [];
	const bookIds: string[] = Array.isArray(likes?.books) ? likes.books : [];
	const shaerIds: string[] = Array.isArray((likes as any)?.shaer) ? (likes as any).shaer : [];
	const rubaiIds: string[] = Array.isArray((likes as any)?.rubai) ? (likes as any).rubai : [];

	const ashaarFilter = useMemo(() => buildIdsFilter(ashaarIds), [ashaarIds.join("|")]);
	const ghazlenFilter = useMemo(() => buildIdsFilter(ghazlenIds), [ghazlenIds.join("|")]);
	const nazmenFilter = useMemo(() => buildIdsFilter(nazmenIds), [nazmenIds.join("|")]);
	const booksFilter = useMemo(() => buildIdsFilter(bookIds), [bookIds.join("|")]);
	const shaerFilter = useMemo(() => buildIdsFilter(shaerIds), [shaerIds.join("|")]);
	const rubaiFilter = useMemo(() => buildIdsFilter(rubaiIds), [rubaiIds.join("|")]);
	const [openanaween, setOpenanaween] = useState<string | null>(null);

	const { updateRecord: updateNazmen } = useAirtableMutation(
		"app5Y2OsuDgpXeQdz",
		"nazmen"
	);
	const { updateRecord: updateAshaar } = useAirtableMutation(
		"appeI2xzzyvUN5bR7",
		"Ashaar"
	);

	const {
		records: ashaarRecords,
		isLoading: ashaarLoading,
		error: ashaarError,
		swrKey: ashaarSWR,
		mutate: mutateAshaar,
	} = useAirtableList<AirtableRecord<AshaarRecord>>(ASHAAR_BASE, ASHAAR_TABLE, {
		pageSize: Math.min(Math.max(ashaarIds.length, 1), 100),
		filterByFormula: ashaarFilter,
	}, { enabled: ashaarIds.length > 0 });
	const ashaarItems = useMemo(() => (ashaarRecords || []).map(formatAshaarRecord), [ashaarRecords]);

	const {
		records: ghazlenRecords,
		isLoading: ghazlenLoading,
		error: ghazlenError,
		swrKey: ghazlenSWR,
		mutate: mutateGhazlen,
	} = useAirtableList<AirtableRecord<GhazlenRecord>>(GHAZLEN_BASE, GHAZLEN_TABLE, {
		pageSize: Math.min(Math.max(ghazlenIds.length, 1), 100),
		filterByFormula: ghazlenFilter,
	}, { enabled: ghazlenIds.length > 0 });
	const ghazlenItems = useMemo(() => (ghazlenRecords || []).map(formatGhazlenRecord), [ghazlenRecords]);

	const {
		records: nazmenRecords,
		isLoading: nazmenLoading,
		error: nazmenError,
		swrKey: nazmenSWR,
		mutate: mutateNazmen,
	} = useAirtableList<AirtableRecord<NazmenRecord>>(NAZMEN_BASE, NAZMEN_TABLE, {
		pageSize: Math.min(Math.max(nazmenIds.length, 1), 100),
		filterByFormula: nazmenFilter,
	}, { enabled: nazmenIds.length > 0 });

	// Books: we only render cards; like/share handled by component
	const {
		records: bookRecords,
		isLoading: booksLoading,
		error: booksError,
		swrKey: booksSWR,
		mutate: mutateBooks,
	} = useAirtableList<any>(BOOKS_BASE, BOOKS_TABLE, {
		pageSize: Math.min(Math.max(bookIds.length, 1), 100),
		filterByFormula: booksFilter,
	}, { enabled: bookIds.length > 0 });

	// Favorite Shaer (Intro records) for liked poet profiles
	const {
		records: shaerRecords,
		isLoading: shaerLoading,
		error: shaerError,
		swrKey: shaerSWR,
		mutate: mutateShaer,
	} = useAirtableList<any>(SHAER_BASE, SHAER_TABLE, {
		pageSize: Math.min(Math.max(shaerIds.length, 1), 100),
		filterByFormula: shaerFilter,
	}, { enabled: shaerIds.length > 0 });

	// Favorite Rubai for liked poet profiles
	const {
		records: rubaiRecords,
		isLoading: rubaiLoading,
		error: rubaiError,
		swrKey: rubaiSWR,
		mutate: mutateRubai,
	} = useAirtableList<any>(RUBAI_BASE, RUBAI_TABLE, {
		pageSize: Math.min(Math.max(rubaiIds.length, 1), 100),
		filterByFormula: rubaiFilter,
	}, { enabled: rubaiIds.length > 0 });

	// Share handlers per section to ensure correct auth gating and dialogs
	const shareAshaar = useShareAction({ section: "Ashaar", title: "" });
	const shareGhazlen = useShareAction({ section: "Ghazlen", title: "" });
	const shareNazmen = useShareAction({ section: "Nazmen", title: "" });

	const nothingToShow =
		(ashaarIds.length + ghazlenIds.length + nazmenIds.length + bookIds.length + shaerIds.length + rubaiIds.length) === 0;

	// Revalidate lists on likes changes (debounced per-category)
	useEffect(() => {
		const revalidate = (table?: string) => {
			const t = String(table || '').toLowerCase();
			try { if ((!t || t === 'ashaar') && ashaarIds.length) mutateAshaar?.(); } catch { }
			try { if ((!t || t === 'ghazlen') && ghazlenIds.length) mutateGhazlen?.(); } catch { }
			try { if ((!t || t === 'nazmen') && nazmenIds.length) mutateNazmen?.(); } catch { }
			try { if ((!t || t === 'books') && bookIds.length) mutateBooks?.(); } catch { }
			try { if ((!t || t === 'shaer') && shaerIds.length) mutateShaer?.(); } catch { }
			try { if ((!t || t === 'rubai') && rubaiIds.length) mutateRubai?.(); } catch { }
		};
		let t: ReturnType<typeof setTimeout> | null = null;
		const onLikesUpdated = (ev: any) => { if (t) clearTimeout(t); const table = ev?.detail?.table; t = setTimeout(() => revalidate(table), 500); };
		document.addEventListener("likes-updated", onLikesUpdated as any);
		return () => { document.removeEventListener("likes-updated", onLikesUpdated as any); if (t) clearTimeout(t); };
	}, [ashaarIds.length, ghazlenIds.length, nazmenIds.length, bookIds.length, shaerIds.length, rubaiIds.length, mutateAshaar, mutateGhazlen, mutateNazmen, mutateBooks, mutateShaer, mutateRubai]);

	// Tab state and URL sync (similar to Shaer page)
	const [activeNav, setActiveNav] = React.useState<string>("");

	// Initialize from URL (?tab=) and track back/forward
	useEffect(() => {
		const initializeActiveNav = () => {
			const urlParams = new URLSearchParams(window.location.search);
			const tab = urlParams.get("tab");
			setActiveNav(tab || "");
		};
		initializeActiveNav();
		window.addEventListener("popstate", initializeActiveNav);
		return () => window.removeEventListener("popstate", initializeActiveNav);
	}, []);

	// Pick the first available section when none selected or current becomes unavailable
	const hasAshaar = ashaarIds.length > 0;
	const hasGhazlen = ghazlenIds.length > 0;
	const hasNazmen = nazmenIds.length > 0;
	const hasBooks = bookIds.length > 0;
	const hasShaer = shaerIds.length > 0;
	const hasRubai = rubaiIds.length > 0;

	useEffect(() => {
		if (!isLoaded) return;
		const available: Record<string, boolean> = {
			"شعراء": hasShaer,
			"اشعار": hasAshaar,
			"غزلیں": hasGhazlen,
			"نظمیں": hasNazmen,
			"کتابیں": hasBooks,
			"رباعی": hasRubai,
		};
		if (activeNav && available[activeNav]) return; // keep user's selection if still valid
		const order = ["شعراء", "اشعار", "غزلیں", "نظمیں", "کتابیں", "رباعی"];
		const first = order.find((t) => available[t]);
		if (first) setActiveNav(first);
	}, [isLoaded, hasAshaar, hasGhazlen, hasNazmen, hasBooks, hasShaer, hasRubai]);
	// include hasShaer in deps
	// eslint-disable-next-line react-hooks/exhaustive-deps

	const handleNavClick = (nav: string) => setActiveNav(nav);
	const handleLinkClick = (nav: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (e.defaultPrevented) return;
		if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		handleNavClick(nav);
	};

	const toggleanaween = (cardId: string | null) => {
		setOpenanaween((prev) => (prev === cardId ? null : cardId));
	};

	const handleShareClick = async (shaerData: Shaer, index: number): Promise<void> => {
		toggleanaween(null);
		// Normalize ghazalHead to string[] for share payload
		const ghazalLines: string[] =
			Array.isArray(shaerData.fields.ghazalHead)
				? shaerData.fields.ghazalHead
				: typeof shaerData.fields.ghazalHead === "string"
					? String(shaerData.fields.ghazalHead).replace(/\r\n?/g, "\n").split("\n").map(s => s.trim()).filter(Boolean)
					: [];
		const unwanFirst =
			Array.isArray(shaerData.fields.unwan)
				? shaerData.fields.unwan[0] || ""
				: typeof shaerData.fields.unwan === "string"
					? (String(shaerData.fields.unwan).split("\n").find(s => s.trim().length > 0) || "")
					: "";
		await shareRecordWithCount(
			{
				section: "Ashaar",
				id: shaerData.id,
				title: shaerData.fields.shaer,
				textLines: ghazalLines.length ? ghazalLines : undefined,
				fallbackSlugText: ghazalLines[0] || unwanFirst || "",
				language,
			},
			{
				onShared: async () => {
					try {
						const updatedShares = (shaerData.fields.shares ?? 0) + 1;
						await updateAshaar([{ id: shaerData.id, fields: { shares: updatedShares } }]);
						// Optimistically update SWR cache using the correct key
						await mutateAshaar(
							(pages: any[] | undefined) => {
								if (!pages || !Array.isArray(pages)) return pages;
								return pages.map((p: any) => ({
									...p,
									records: (p.records || []).map((r: any) =>
										r.id === shaerData.id
											? { ...r, fields: { ...r.fields, shares: updatedShares } }
											: r
									),
								}));
							},
							{ revalidate: false }
						);
					} catch (error) {
						console.error("Error updating shares:", error);
					}
				},
			}
		);
	};

	// Removed explicit refresh; sections will revalidate when navigating naturally

	return (
		<div className="container mx-auto p-4" dir="rtl">
			{/* No explicit likes loading spinner; rely on section skeletons */}

			{isLoaded && nothingToShow && (
				<div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-2">
					<div className="text-3xl">♡</div>
					<div className="text-xl">آپ کی پسندیدہ فہرست خالی ہے</div>
					<div className="max-w-prose">جب آپ کوئی شعر، غزل، یا کتاب پسند کریں گے تو وہ یہاں نظر آئے گی</div>
					<a href="/" className="mt-2 inline-flex items-center px-4 py-2 rounded bg-primary text-primary-foreground">مواد دیکھیں</a>
				</div>
			)}

			{/* Tabs navigation (only if there's anything to show) */}
			{isLoaded && !nothingToShow && (
				<>
					<div className="inner-navs w-full md:w-[80vw] flex flex-row gap-3 border-b-2 self-center pb-0 px-4 pt-4 text-xl">
						{hasShaer && (
							<div className={`nav-item ${activeNav === "شعراء" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("شعراء")}`} onClick={handleLinkClick("شعراء")}>
									شعراء
								</a>
							</div>
						)}
						{hasAshaar && (
							<div className={`nav-item ${activeNav === "اشعار" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("اشعار")}`} onClick={handleLinkClick("اشعار")}>
									اشعار
								</a>
							</div>
						)}
						{hasGhazlen && (
							<div className={`nav-item ${activeNav === "غزلیں" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("غزلیں")}`} onClick={handleLinkClick("غزلیں")}>
									غزلیں
								</a>
							</div>
						)}
						{hasNazmen && (
							<div className={`nav-item ${activeNav === "نظمیں" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("نظمیں")}`} onClick={handleLinkClick("نظمیں")}>
									نظمیں
								</a>
							</div>
						)}
						{hasBooks && (
							<div className={`nav-item ${activeNav === "کتابیں" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("کتابیں")}`} onClick={handleLinkClick("کتابیں")}>
									کتابیں
								</a>
							</div>
						)}
						{hasRubai && (
							<div className={`nav-item ${activeNav === "رباعی" ? "active" : ""} min-w-[40px] text-center transition-all ease-in-out duration-500`}>
								<a href={`/Favorites?tab=${encodeURIComponent("رباعی")}`} onClick={handleLinkClick("رباعی")}>
									رباعی
								</a>
							</div>
						)}
					</div>
				</>
			)}

			{/* Content panes */}
			{activeNav === "شعراء" && hasShaer && (
				<section className="mb-6">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
						{shaerError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateShaer?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!shaerLoading && (shaerRecords || []).map((rec: any, index: number) => (
							<div className="relative" key={rec.id || index}>
								<ShaerCard data={rec} showLikeButton baseId={SHAER_BASE} table={SHAER_TABLE} storageKey="Shura" />
							</div>
						))}
						{shaerLoading && Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
				</section>
			)}
			{activeNav === "اشعار" && hasAshaar && (
				<section className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{ashaarError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateAshaar?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!ashaarLoading && ashaarItems.map((rec: any, index: number) => (
							<DataCard
								key={rec.id}
								page="ashaar"
								shaerData={rec as any}
								index={index}
								download={true}
								baseId={ASHAAR_BASE}
								table={"Ashaar"}
								storageKey="Ashaar"
								swrKey={ashaarSWR}
								toggleanaween={() => { }}
								openanaween={null}
								handleCardClick={() => { }}
								handleShareClick={handleShareClick}
								openComments={() => { }}
							/>
						))}
						{ashaarLoading && Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{activeNav === "غزلیں" && hasGhazlen && (
				<section className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{ghazlenError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateGhazlen?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!ghazlenLoading && ghazlenItems.map((rec: any, index: number) => (
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
								toggleanaween={() => { }}
								openanaween={null}
								handleCardClick={() => { }}
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
								openComments={() => { }}
							/>
						))}
						{ghazlenLoading && Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{activeNav === "نظمیں" && hasNazmen && (
				<section className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{nazmenError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateNazmen?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!nazmenLoading && (nazmenRecords || []).map((rec: any, index: number) => {
							const f = (rec as any).fields || {};
							const display = String(f.displayLine || "").replace(/\r\n?/g, "\n").split("\n").filter((s: string) => s.trim().length > 0);
							const fallbackLine = (String(f.nazm || "").replace(/\r\n?/g, "\n").split("\n").find((s: string) => s.trim().length > 0)) || (String(f.unwan || "").replace(/\r\n?/g, "\n").split("\n").find((s: string) => s.trim().length > 0)) || "";
							const enriched = {
								...rec,
								fields: {
									...f,
									// Only preview short header lines like main Nazmen page
									ghazalHead: display.length > 0 ? display : [fallbackLine].filter(Boolean),
								},
							};
							return (
								<DataCard
									key={rec.id}
									page="nazm"
									shaerData={enriched as any}
									index={index}
									download={false}
									baseId={NAZMEN_BASE}
									table={NAZMEN_TABLE}
									storageKey="Nazmen"
									swrKey={nazmenSWR}
									toggleanaween={() => { }}
									openanaween={null}
									handleCardClick={() => { }}
									handleShareClick={async (shaerData: any, idx: number) => {
										toggleanaween(null);
										const ghazalHead: string[] =
											Array.isArray(shaerData.fields.ghazalHead)
												? shaerData.fields.ghazalHead
												: typeof shaerData.fields.ghazalHead === "string"
													? String(shaerData.fields.ghazalHead).replace(/\r\n?/g, "\n").split("\n").map(s => s.trim()).filter(Boolean)
													: [];
										const unwanFirst =
											Array.isArray(shaerData.fields.unwan)
												? shaerData.fields.unwan[0] || ""
												: typeof shaerData.fields.unwan === "string"
													? (String(shaerData.fields.unwan).split("\n").find(s => s.trim().length > 0) || "")
													: "";
										await shareRecordWithCount(
											{
												section: "Nazmen",
												id: shaerData.id,
												title: shaerData.fields.shaer,
												textLines: ghazalHead.length ? ghazalHead : undefined,
												fallbackSlugText: ghazalHead[0] || unwanFirst || "",
												language,
											},
											{
												onShared: async () => {
													try {
														const updatedShares = (shaerData.fields.shares ?? 0) + 1;
														await updateNazmen([{ id: shaerData.id, fields: { shares: updatedShares } }]);
														await mutateNazmen(
															(pages: any[] | undefined) => {
																if (!pages || !Array.isArray(pages)) return pages;
																return pages.map((p: any) => ({
																	...p,
																	records: (p.records || []).map((r: any) =>
																		r.id === shaerData.id
																			? { ...r, fields: { ...r.fields, shares: updatedShares } }
																			: r
																	),
																}));
															},
															{ revalidate: false }
														);
													} catch (error) {
														console.error("Error updating shares:", error);
													}
												},
											}
										);
									}}
									openComments={() => { }}
								/>
							);
						})}
						{nazmenLoading && Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
					{/* Share no longer requires login */}
				</section>
			)}

			{activeNav === "کتابیں" && hasBooks && (
				<section className="mb-6">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{booksError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateBooks?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!booksLoading && (bookRecords || []).map((rec: any) => (
							<Card key={rec.id} data={rec} showLikeButton baseId={BOOKS_BASE} table={BOOKS_TABLE} storageKey="Books" swrKey={booksSWR} />
						))}
						{booksLoading && Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
				</section>
			)}

			{activeNav === "رباعی" && hasRubai && (
				<section className="mb-6">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{rubaiError && (
							<div className="col-span-full border border-orange-400/50 bg-orange-100/30 text-orange-900 rounded p-3 flex items-center justify-between">
								<span>ڈیٹا لوڈ کرنے میں خرابی</span>
								<button onClick={() => mutateRubai?.()} className="px-3 py-1 rounded border">دوبارہ کوشش کریں</button>
							</div>
						)}
						{!rubaiLoading && (rubaiRecords || []).map((rec: any, index: number) => {
							// Hook up like/share interactions like regular Rubai pages
							const record = rec as AirtableRecord<any>;
							const baseId = RUBAI_BASE;
							const table = RUBAI_TABLE;
							// Inline per-card like hook without lifting state
							const LikeWrapper: React.FC = () => {
								const { useLikeButton } = require("../../hooks/useLikeButton");
								const like = useLikeButton({
									baseId,
									table,
									storageKey: "Rubai",
									recordId: record.id,
									currentLikes: (record as any).fields?.likes ?? 0,
									swrKey: rubaiSWR,
								});
								const share = useShareAction({ section: "Rubai", title: "" });
								const onHeartClick = async (_e: React.MouseEvent<HTMLButtonElement>) => { await like.handleLikeClick(); };
								const onShare = async () => {
									await share.handleShare({
										baseId,
										table,
										recordId: record.id,
										title: (record as any).fields?.shaer,
										textLines: [String((record as any).fields?.body ?? "")],
										fallbackSlugText: (String((record as any).fields?.body ?? "").split("\n").find((l: string) => l.trim().length > 0) ?? ""),
										swrKey: rubaiSWR,
										currentShares: (record as any).fields?.shares ?? 0,
									});
								};
								return (
									<RubaiCard
										RubaiData={record as any}
										index={index}
										handleHeartClick={onHeartClick}
										openComments={() => { }}
										handleShareClick={() => onShare()}
										isLiking={like.isDisabled}
										isLiked={like.isLiked}
										likesCount={like.likesCount}
									/>
								);
							};
							return (
								<div key={record.id}>
									<LikeWrapper />
								</div>
							);
						})}
						{rubaiLoading && Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="h-40 bg-muted animate-pulse rounded" />
						))}
					</div>
				</section>
			)}
		</div>
	);
}
