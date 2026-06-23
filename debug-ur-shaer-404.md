# Debug Session: ur-shaer-404

## Status
- [OPEN]

## Symptom
- `app/Shaer/[name]/page.tsx` returns `404` for an existing poet route.
- Application-level error seen: `Rendered more hooks than during the previous render.`
- Terminal also shows `fetch failed` with `ECONNREFUSED`.

## Hypotheses
1. The page fetches its own API from `http://localhost:3000` while the dev server is running on another port, causing `ECONNREFUSED`.
2. The poet lookup still uses exact equality and misses due to whitespace or slug normalization.
3. The page masks a lower-level API connectivity error by converting it into `notFound()`.
4. The hook-render error is a downstream client issue triggered after failed server fetch / inconsistent render state.
5. Both metadata and page render perform the same failing fetch, multiplying the bad behavior.

## Evidence Log
- Pending.

## Fix
- Pending evidence.
