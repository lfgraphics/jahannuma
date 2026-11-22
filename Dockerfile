# Build stage 1: Dependencies
FROM node:20-alpine AS deps
# libc6-compat is required for some Alpine node modules and Turbopack
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm matching packageManager version
RUN npm install -g pnpm@10.20.0

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage 2: Application Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10.20.0

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables for Next.js static generation
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ALLOWED_ORIGINS
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AIRTABLE_BASE_ID
ARG NEXT_PUBLIC_Blogger_API
ARG NEXT_PUBLIC_Youtube_API
ARG NEXT_PUBLIC_PDFViewer_Key
ARG NEXT_PUBLIC_Api_Token

ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_SIGN_UP_URL \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_ALLOWED_ORIGINS=$NEXT_PUBLIC_ALLOWED_ORIGINS \
    NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL \
    NEXT_PUBLIC_AIRTABLE_BASE_ID=$NEXT_PUBLIC_AIRTABLE_BASE_ID \
    NEXT_PUBLIC_Blogger_API=$NEXT_PUBLIC_Blogger_API \
    NEXT_PUBLIC_Youtube_API=$NEXT_PUBLIC_Youtube_API \
    NEXT_PUBLIC_PDFViewer_Key=$NEXT_PUBLIC_PDFViewer_Key \
    NEXT_PUBLIC_Api_Token=$NEXT_PUBLIC_Api_Token

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build

# Build stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create unprivileged user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
