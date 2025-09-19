# Next.js 15 & React 19 Upgrade Commands

## Prerequisites
1. Commit all current changes
2. Create a backup branch:
   ```bash
   git checkout -b upgrade/next15-react19
   ```

## Step 1: Run Next.js 15 Upgrade Codemod
```bash
npx @next/codemod@canary upgrade latest
```

## Step 2: Run Next.js 15 Specific Codemods
```bash
# Async Request APIs migration
npx @next/codemod@canary next-async-request-api .

# Runtime config migration (if using experimental edge runtime config)
npx @next/codemod@latest app-dir-runtime-config-experimental-edge .

# NextRequest geo/ip migration (if applicable)
npx @next/codemod@latest next-request-geo-ip .
```

## Step 3: Run React 19 Migration
```bash
# Complete React 19 migration recipe
npx codemod@latest react/19/migration-recipe

# TypeScript types migration
npx types-react-codemod@latest preset-19 ./app
```

## Step 4: Manual Verification
1. Run `npm run type-check` to verify TypeScript compliance
2. Run `npm run build:check` to test build process with types
3. Test development server:
   ```bash
   npm run dev
   ```
4. Review and fix any remaining type errors & ESLint warnings
5. Validate PWA still registers (in production build) if applicable

## Step 5: Update File Extensions
Convert remaining `.js` / `.jsx` files to `.ts` / `.tsx` for consistency.
Suggested command (Linux/macOS, adapt manually for Windows):
```bash
find app -name "*.jsx" -exec bash -c 'f="{}"; git mv "$f" "${f%.*}.tsx"' \;
```
On Windows (PowerShell example):
```powershell
Get-ChildItem -Path .\app -Recurse -Filter *.jsx | ForEach-Object { git mv $_.FullName ($_.FullName -replace '\\.jsx$', '.tsx') }
```

## Step 6: Post-Upgrade Checklist
- [ ] All pages compile without type errors
- [ ] No usage of deprecated Next.js APIs
- [ ] No React 18 legacy behavior warnings in console
- [ ] ESLint passes: `npm run lint`
- [ ] PWA service worker builds correctly (if still required)
- [ ] Images load with updated remotePatterns

## Rollback Plan
If issues arise:
```bash
git reset --hard HEAD~1   # or checkout the previous branch
```

## Notes
- Some codemods may be no-ops depending on current usage.
- React 19 introduces new types; ensure 3rd-party libraries are compatible.
- Remove temporary suppressions after fixing underlying issues.
