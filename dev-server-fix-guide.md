# Development Server Fix Guide

## Issues Fixed

### 1. PostCSS Configuration Error
**Problem**: Malformed CSS syntax in `app/Components/quiz.css` line 2: `padding: 20px p;`
**Solution**: Corrected to `padding: 20px;` and migrated styles to theme variables.

### 2. Duplicate Configuration Files
**Problem**: Both `next.config.js` and `next.config.mjs` existed causing potential conflicts.
**Solution (Done)**: Removed `next.config.js`, standardized on ESM `next.config.mjs` with `experimental.typedRoutes=false` and PWA gated by `ENABLE_PWA`.

### 3. File Extension Inconsistency
**Problem**: Mixed `.jsx` and `.tsx` components (`Quiz.jsx`, `BookCard.jsx`).
**Solution (Done)**: Removed `.jsx` duplicates and standardized imports to the `.tsx` components (`Quiz.tsx`, `BookCard.tsx`).

### 4. Hardcoded Colors
**Problem**: Components and CSS used fixed hex codes.
**Solution**: Replaced with semantic Tailwind + CSS variables (`text-primary`, `hsl(var(--primary))`, etc.).

### 5. Theming Tokens Missing
**Problem**: Needed success/shadow tokens for quiz and toast styling.
**Solution**: Added `--success`, `--success-foreground`, and `--shadow` to light/dark theme blocks in `app/globals.css`.

## Verification Commands

```bash
# (Optional) clear Next.js cache
rm -rf .next

# Install dependencies (ensure new packages are installed)
npm install

# Start dev server
npm run dev

# Type check
npm run type-check
```

## Manual QA Checklist
- Quiz page loads without PostCSS errors.
- Quiz buttons show themed hover + disabled states.
- Correct / incorrect answers apply success & destructive themed colors.
- Toast notifications (if triggered) use themed background, border, and progress bar colors.
- No duplicate Next.js config warning.
- TypeScript build passes for converted components.

## Future Prevention
1. Run `npm run type-check` before commits.
2. Keep a single Next.js config file (prefer `.mjs`).
3. Use `.tsx` for all React components.
4. Prefer semantic classes + CSS variables to raw hex values.
5. Add linting rules for disallowing hardcoded brand hex codes.

## Next Candidates (Not Implemented Yet)
- Migrate remaining components with hardcoded colors.
- Introduce ESLint custom rule or stylelint for brand color enforcement.
- Extract quiz + toast into modular shadcn-style components.
