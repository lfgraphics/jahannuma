# Jahannuma

## Overview

Jahannuma is a multilingual digital library for Urdu-first poetry and literature with English and Hindi alternates. It organizes classical forms such as Ashaar, Ghazlen, Nazmen, Rubai and E‑Books, and exposes them through SEO‑ready, localized Next.js routes. Content is sourced from Airtable and served via versioned API endpoints with field validation, caching and resilient fallbacks. Client features include language‑aware data fetching, likes/favorites backed by Clerk user metadata, and a progressive web app experience with offline‑friendly patterns. The focus is operational reliability: fast list and record reads, consistent schema mapping, and safe degradation when external services are slow or unavailable.

## Problem It Solves

- Centralizes scattered poetry content into a structured, queryable catalog.
- Removes manual duplication of content per language by using a multilingual field mapping layer.
- Provides predictable, typed API responses and runtime validation against Airtable schema to reduce data mismatches.
- Adds SEO, PWA, and caching so readers in low‑bandwidth locales get fast, shareable pages.
- Offloads light user state (likes/favorites) to Clerk public metadata to avoid managing a separate database.

## Target Users

- Editors and curators managing Urdu/Hindi/English literature collections.
- Web readers seeking fast, localized access to poetry and ebooks.
- Frontend developers integrating poetry data via stable API routes.
- Internal operations teams maintaining content pipelines and SEO.

## Architecture & Technical Design

- Backend structure
  - Next.js App Router API routes under app/api and localized mirrors under app/EN/api and app/HI/api. Examples: [ashaar route](/app/api/airtable/ashaar/route.ts), [ebooks route](/app/api/airtable/ebooks/route.ts).
  - Airtable integration via a dedicated configuration and client layer with schema validation, error logging, and fallbacks. Key modules: [airtable-client](/src/lib/airtable/airtable-client.ts), [config-manager](/src/lib/airtable/config-manager.ts), [field-validator](/src/lib/airtable/field-validator.ts), [error logger](/src/lib/airtable/airtable-error-logger.ts).
  - Enhanced API responses for consistent success/error payloads and request validation: [enhanced-api-response](/lib/enhanced-api-response.ts), helpers in [api-route-helpers](/lib/api-route-helpers.ts).
  - Likes/favorites via Clerk-backed endpoints: [user likes route (UR)](/app/api/user/likes.ts), localized equivalents under EN/HI.
- Frontend structure
  - Next.js App Router with language directories: Urdu at root (default RTL), English under app/EN, Hindi under app/HI. Pages mirror across languages (e.g., Ashaar, Ghazlen, Nazmen, Rubai, E‑Books).
  - Hooks for data access with SWR and universal fetcher: [useAirtableList](/hooks/useAirtableList.ts), [useEnhancedAirtableList](/hooks/useEnhancedAirtableList.ts), [universal-data-fetcher](/lib/universal-data-fetcher.ts).
  - Multilingual SEO generator and structured data utilities: [MultilingualSEO](/components/seo/MultilingualSEO.tsx), [SEO metadata](/src/lib/seo/metadata.ts).
  - UI is componentized under app/Components and language‑specific variants under app/EN/Components and app/HI/Components.
- Database design approach
  - Airtable acts as the primary store. Each content type has base fields plus English/Hindi mappings defined centrally to avoid repetition and to enable strict validation and auto‑suggestions for invalid field names. See [multilingual field constants](/lib/multilingual-field-constants.ts).
  - Record formatters normalize Airtable records for the client: [airtable-utils](/src/lib/airtable/airtable-utils.ts).
- Key integrations
  - Clerk for authentication and user metadata (likes/favorites).
  - SWR for client caching and revalidation, wrapped with a universal fetcher for SSR/CSR parity.
  - Optional PDF viewing via @pdftron/webviewer and a small proxy server for Google Drive files: [PdfViewer](/app/Components/PdfViewer.tsx), [pdf backend](/pdf-backend-2/server.ts).
- Patterns used
  - Modular architecture with clear lib/hooks/app layering.
  - API routes follow a standardized validation and response pattern.
  - Multilingual content model via centralized field maps and language‑aware hooks.
- Scalability considerations
  - Language‑aware caching and SWR deduping limit network traffic.
  - Universal data fetcher provides server/client caching and retry logic.
  - Build‑safe fallbacks and performance monitoring modules minimize outages due to upstream slowness.

## Key Features

- Multilingual content with field‑mapped English and Hindi alternates; Urdu default with RTL UI.
- Airtable‑backed content APIs with pagination, filtering, search, sort and validated field selection.
- Likes/favorites stored in Clerk user public metadata, with optimistic UI updates and server revalidation.
- SEO and structured data generation per language plus sitemap and PWA manifest.
- PDF ebook viewing with optional Google Drive proxy to handle range requests and CORS.

## Automation & Optimization

- Airtable configuration validation and field pre‑validation reduce runtime mismatches and produce operator‑friendly error logs.
- Universal data fetcher + SWR Provider unify server/client strategies with TTL‑based caching and cache keys.
- Performance monitoring utilities track API failures, cache hits and request timings to aid tuning.
- Scripts for bundle analysis and HTTPS dev server are available via package.json.

## Installation & Setup

- Prerequisites
  - Node.js 18+ and pnpm.
- Install
  - pnpm install
- Required environment
  - AIRTABLE_API_KEY, AIRTABLE_BASE_ID
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- Optional environment (enable extra capabilities)
  - NEXT_PUBLIC_PDFViewer_Key (PDF viewer), NEXT_PUBLIC_BACKEND_URL (PDF proxy), NEXT_PUBLIC_ALLOWED_ORIGINS (CORS), NEXT_PUBLIC_Youtube_API and NEXT_PUBLIC_Blogger_API (media content), GOOGLE_SITE_VERIFICATION
- Run
  - pnpm dev
  - App runs on <http://localhost:3000>

## Engineering Highlights

- Performance decisions
  - Language‑aware caching and SWR deduping to minimize over‑fetching.
  - Universal fetcher with server/client parity and retry; TTL‑based cache keys for lists and records.
  - Build‑time fallbacks to avoid build failures when upstreams are temporarily unavailable.
- Security decisions
  - Airtable access is server‑side only; API keys are never exposed to the client.
  - Clerk middleware gates protected routes (e.g., Favorites) and normalizes language path prefixes: [middleware](/middleware.ts).
  - CORS/allowed origins configurable via NEXT_PUBLIC_ALLOWED_ORIGINS.
- Design trade‑offs
  - Using Airtable simplifies editorial workflows but requires strict field mapping and validation to keep schema drift under control.
  - Client‑side likes stored in Clerk public metadata avoid a dedicated DB but provide approximate counts under high concurrency; SWR revalidation converges on server truth.
  - Localized API mirrors increase surface area but keep language‑specific behavior and caching explicit.
- Technology choices
  - Next.js App Router for co‑located routes/components and RSC‑friendly structure.
  - SWR for stable incremental loading and cache control with simple mental model.
  - Clerk for low‑friction auth and per‑user public metadata.

## Future Improvements

- Add atomic server‑side counters for likes to remove eventual consistency under high concurrency.
- Introduce search indices and precomputed aggregates for faster cross‑type queries.
- Expand SSR where SEO impact is highest while keeping CSR with SWR for infinite lists.
- Add admin tools to validate Airtable schema and field mappings continuously.
- Migrate to a more robust DB like Postgres for more complex queries and joins.
