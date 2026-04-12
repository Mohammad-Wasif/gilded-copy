# Codebase Audit: Hindustan Embroidery (Gilded Heirloom)

> [!NOTE]
> Full-stack e-commerce application — **React + Vite + TailwindCSS v4** frontend / **Express + Prisma + PostgreSQL** backend.
> Audit date: 2026-04-10 · ~2,800 LoC frontend · ~1,200 LoC backend

---

## Severity Legend

| Emoji | Meaning |
|-------|---------|
| 🔴 | **Critical** — Security risk, data loss, or broken functionality |
| 🟠 | **High** — Likely to cause bugs, poor UX, or maintenance pain |
| 🟡 | **Medium** — Code-smell, best-practice violation |
| 🟢 | **Low** — Nice-to-have improvement |

---

## 1 · Security Issues

### 🔴 S-1: Database credentials committed to Git
**File:** [.env](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/.env)

```
DATABASE_URL="postgresql://postgres:Wasif786@localhost:5432/hindustanemb_db?schema=public"
```

The `.env` file with real credentials (user `postgres`, password `Wasif786`) is tracked in the repo. The root `.gitignore` has `.env*` but the `backend/.gitignore` appears to not be excluding it effectively since the file exists.

**Fix:** Rotate the password immediately, ensure `backend/.env` is in `.gitignore`, and add it to `.git/info/exclude`.

---

### 🔴 S-2: CORS origin mismatch between frontend and backend
**File:** [backend/.env](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/.env) · [api.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/lib/api.ts)

The backend `CORS_ORIGIN` is set to `http://localhost:5173` but the frontend Vite dev server runs on port **3000** (`vite --port=3000`). This means CORS will **block all API requests** from the frontend in development.

**Fix:** Change `CORS_ORIGIN` to `http://localhost:3000` or make it dynamic.

---

### 🟠 S-3: API base URL hardcoded
**File:** [api.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/lib/api.ts#L3)

```ts
const API_BASE_URL = 'http://localhost:5000';
```

Hardcoded API URL won't work in production. Should use `import.meta.env.VITE_API_URL` or a Vite-defined environment variable.

---

### 🟠 S-4: Gemini API key exposed to client bundle
**File:** [vite.config.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/vite.config.ts#L11)

```ts
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
```

This injects the API key directly into the client-side JavaScript bundle. `@google/genai` is also a frontend dependency. Any API key usage must be proxied through the backend.

---

### 🟠 S-5: No input sanitization or rate limiting on backend
**File:** [catalog.routes.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/src/routes/catalog.routes.ts)

- No rate limiting middleware (e.g., `express-rate-limit`)
- No helmet for HTTP security headers
- While Zod validates shape, there's no sanitization against SQL injection edge cases in the `searchProducts` LIKE queries (though Prisma parameterizes, the surface area is still wide)

---

## 2 · Architecture & Data Flow Problems

### 🔴 A-1: Checkout & Payment pages use hardcoded dummy data — NOT connected to cart
**Files:** [Checkout/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Checkout/index.tsx) · [Payment/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Payment/index.tsx)

The Checkout page shows hardcoded items ("Gilded Zari Shawl — ₹12,500", "Gold Thread Embroidery Kit — ₹3,200") regardless of what's in the cart. The Payment page shows entirely different items ("The Empress Stole — ₹42,500"). **Users will see wrong order summaries.**

**Fix:** Pull items from `useCart()` context, just like the Cart page does.

---

### 🟠 A-2: Cart state not persisted
**File:** [CartContext.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/context/CartContext.tsx)

Cart uses `useState` with hardcoded default items. Every page refresh resets the cart to 3 pre-filled items. Users lose their actual selections.

**Fix:**
- Use `localStorage` to persist cart state
- Remove the hardcoded `defaultItems` — start with an empty cart
- Consider `useReducer` for more predictable state mutations

---

### 🟠 A-3: Type mismatch: `addToCart` called with incompatible objects
**Files:** [Home/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Home/index.tsx#L206) · [Shop/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Shop/index.tsx#L235) · [ProductDetail/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/ProductDetail/index.tsx#L79)

All three pages cast the add-to-cart object as `as any` to bypass TypeScript:

```ts
addToCart(cartItemObj as any);
```

The `CartItem` interface expects `{ id, name, variant, price, quantity, image }` but the pages pass `{ id, productId, variantId, name, price, quantity, imageUrl, variantTitle }` — different property names (`image` vs `imageUrl`, `variant` vs `variantTitle`).

**Result:** Cart items added from product pages will have **missing images and variant labels**.

---

### 🟠 A-4: Auth page has no actual authentication logic
**File:** [Auth/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Auth/index.tsx#L66)

The form does nothing on submit (`onSubmit={(e) => e.preventDefault()}`). There is no auth backend, no session management, no protected routes. The Google/GitHub OAuth buttons are non-functional.

---

### 🟡 A-5: Duplicate Navbar & Footer in Contact page
**File:** [Contact/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Contact/index.tsx)

The Contact page defines its own `ContactNavbar` and `ContactFooter` (lines 7-106) that are near-identical copies of the shared Header/Footer. This is 100+ lines of duplicated code that will drift out of sync.

**Fix:** Use the `MainLayout` pattern, or compose a variant of the shared components.

---

### 🟡 A-6: Support pages (FAQ, Privacy, Terms, Shipping) lack shared layout
**Files:** [Faq](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Faq), [PrivacyPolicy](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/PrivacyPolicy), etc.

These pages are mounted **outside** MainLayout (no Header/Footer). They rely on `SupportPageLayout` but have no consistent navigation back. The user experience is inconsistent — clicking FAQ from the footer drops you into a page with no site navigation.

---

### 🟡 A-7: Two wildcard 404 routes can conflict
**File:** [App.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/App.tsx#L44-L58)

```tsx
<Route path="*" element={<NotFound />} />  // Line 44, inside MainLayout
<Route path="*" element={<NotFound />} />  // Line 58, outside MainLayout
```

Two catch-all routes. The inner one (inside `MainLayout`) will match first for paths under `/` but the outer one is unreachable for most cases.

---

## 3 · Frontend Code Quality

### 🟠 F-1: Missing error handling in API calls
**Files:** [Home/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Home/index.tsx) (lines 48, 97, 158)

All `useEffect` API calls use `.catch(console.error)`. Users see either "Loading..." forever or a flash of empty state with no retry option.

```ts
api.catalog.getShopByApplication().then(res => {
  if (res.success) setApps(res.data);
}).catch(console.error).finally(() => setLoading(false));
```

**Fix:** Add error state (`const [error, setError] = useState(...)`) and display a user-friendly fallback with a retry button.

---

### 🟠 F-2: No loading skeletons — jarring CLS (Cumulative Layout Shift)
All data-fetching pages render `"Loading categories..."` as plain text, causing layout jumps when data arrives.

**Fix:** Use skeleton components matching the final layout dimensions.

---

### 🟡 F-3: Missing `key` props using index-based keys
**File:** [Header.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/components/Header/Header.tsx#L9)

```tsx
{[1, 2].map((i) => (
  <div key={i}> // Numeric keys for identical content
```

Not a bug here since the list is static, but the pattern is fragile.

---

### 🟡 F-4: `React` imported but unused
**Files:** [Auth/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Auth/index.tsx#L1), [Contact/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Contact/index.tsx#L1)

```ts
import React, { useState } from 'react';
```

With React 17+ JSX transform, `React` doesn't need to be imported. This is unused and will generate lint warnings.

---

### 🟡 F-5: Giant monolithic page components
- `Home/index.tsx` — **328 lines**, 5 sections all in one file
- `Shop/index.tsx` — **296 lines**
- `ProductDetail/index.tsx` — **352 lines**
- `Contact/index.tsx` — **306 lines**

**Fix:** Extract each section (Hero, CategorySection, BestSellers, etc.) into separate files under the page directory.

---

### 🟡 F-6: Client-side price filtering is unreliable
**File:** [Shop/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Shop/index.tsx#L78)

```ts
const filteredProducts = products.filter(p => parseFloat(p.basePrice) <= priceRange);
```

Price filtering happens client-side on already-paginated data. If page 1 returns 12 items at ₹5000+ but the slider is at ₹4000, you see 0 items despite products matching on other pages.

**Fix:** Pass price filter to the backend API.

---

### 🟡 F-7: `material-symbols-outlined` loaded via Google Fonts but also using Lucide React
**Files:** [index.html](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/index.html#L7), various components

The app loads **Material Symbols** font (77KB+) but also bundles **lucide-react** icons. This is redundant — pick one icon system.

---

## 4 · Backend Code Quality

### 🟠 B-1: Express 5 + types version conflict
**File:** [backend/package.json](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/package.json)

```
"express": "^5.2.1",
"@types/express": "^5.0.6",
```

Express 5 is still in alpha/beta and has breaking API changes. The types may not match. Consider using Express 4.x which is stable, or ensure thorough testing.

---

### 🟡 B-2: Route ordering issue — `/products/:slug` can shadow `/products/featured` and `/products/best-sellers`
**File:** [catalog.routes.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/src/routes/catalog.routes.ts)

The static routes (`/products/featured`, `/products/best-sellers`, `/products/by-category/:slug`) are defined **before** the dynamic `/products/:slug` (line 218), which is correct. However, the `/products` list endpoint (line 156) is defined **after** `by-category/:slug` — this is fine for Express but fragile if routes are reordered.

**Suggestion:** Add a comment block clarifying route ordering requirements.

---

### 🟡 B-3: No database connection pooling configuration
**File:** [db.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/src/config/db.ts)

The `PrismaPg` adapter is used with a bare connection string. No pool size, timeout, or idle timeout configuration. Under load this can exhaust connections.

---

### 🟡 B-4: `getBestSellerProducts` is a fake ranking
**File:** [catalog.service.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/src/modules/catalog/catalog.service.ts#L264)

```ts
export async function getBestSellerProducts(limit: number) {
  // Orders by isFeatured, sortOrder, createdAt — not actual sales data
  return { items, rankingSource: "merchandising_proxy" };
}
```

Fine for MVP but should be documented and eventually replaced with real order-based analytics.

---

### 🟡 B-5: Missing `Product.sku` and `Product.stockQuantity` should not be nullable
**File:** [schema.prisma](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/prisma/schema.prisma#L57-L58)

```prisma
sku            String?   @unique @db.VarChar(64)
stockQuantity  Int?
```

The frontend treats `product.sku` as always-present (displays it in ProductDetail). Also, `stockQuantity` being nullable means you can't reliably determine stock status.

---

### 🟢 B-6: Test route left in production
**File:** [routes/index.ts](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/backend/src/routes/index.ts#L10)

```ts
apiRouter.use("/test", testRouter);
```

A test endpoint is exposed. Should be conditionally enabled only in development.

---

## 5 · Project Hygiene & DevOps

### 🟠 P-1: Stale / dead files in root
**Files in root directory that should not be there:**

| File | Issue |
|------|-------|
| `_orig_shop.tsx` (35KB) | Old backup file — should be deleted or moved |
| `shop.html` (23KB) | Static HTML prototype — stale |
| `detail.html` (24KB) | Static HTML prototype — stale |
| `metadata.json` | Unknown purpose |
| `ts_errors.txt` | Debug artifact |
| `.agent.md` | AI agent context file |
| `postcss.config.cjs` | TailwindCSS v4 doesn't need this with the Vite plugin |
| `server.err.log` / `server.out.log` | Log files in backend/ — should be gitignored |
| `out.txt` | Debug output in backend/ |

---

### 🟠 P-2: `vite` listed in both `dependencies` and `devDependencies`
**File:** [package.json](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/package.json#L24-L35)

```json
"dependencies": {
  "vite": "^6.2.0"   // ← Should only be in devDependencies
},
"devDependencies": {
  "vite": "^6.2.0"
}
```

Also `@vitejs/plugin-react`, `@tailwindcss/vite`, `express`, and `dotenv` are in `dependencies` but should be in `devDependencies` (or shouldn't be in the frontend at all — `express` is a backend dependency).

---

### 🟡 P-3: No ESLint or Prettier configuration
There are no `.eslintrc`, `.prettierrc`, or equivalent config files. The codebase has inconsistent line endings (mixed `\r\n` and `\n`).

---

### 🟡 P-4: No test files anywhere in the project
Zero test files across both frontend and backend. No `jest.config`, `vitest.config`, or test directories.

---

### 🟡 P-5: `tsconfig.json` has no `strict` mode
**File:** [tsconfig.json](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/tsconfig.json)

Missing `"strict": true` means no strict null checks, no strict function types, etc. The many `as any` casts in the codebase would surface as real errors with strict mode.

---

### 🟡 P-6: Package name is generic
**File:** [package.json](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/package.json#L2)

```json
"name": "react-example"
```

Should be `hindustan-embroidery` or similar.

---

### 🟡 P-7: Copyright year is 2024
**Files:** Footer, Auth page

```
© 2024 Hindustan Embroidery
```

Should be dynamically generated or updated to current year.

---

## 6 · Performance

### 🟡 PF-1: No image optimization
All product images are served directly from `lh3.googleusercontent.com` without:
- Width/height attributes (causes CLS)
- `loading="lazy"` attribute
- `srcset` for responsive images
- No fallback or blur placeholder

---

### 🟡 PF-2: No code splitting
All 14 pages are imported eagerly in `App.tsx`:

```tsx
import Home from './pages/Home';
import Shop from './pages/Shop';
// ... etc
```

**Fix:** Use `React.lazy()` with `Suspense` for route-based code splitting.

---

### 🟡 PF-3: Duplicate API calls
`getCategoryTree()` is called independently in:
1. `Home/index.tsx` → CategorySection
2. `Shop/index.tsx` → Sidebar

No client-side caching. Consider React Query / SWR or a simple cache layer.

---

## 7 · SEO & Accessibility

### 🟡 SEO-1: Single `<title>` for all pages
**File:** [index.html](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/index.html#L6)

Every page shows "Hindustan Embroidery" in the browser tab. Product pages, shop pages, etc. all share the same title.

**Fix:** Use `document.title` or `react-helmet-async` per page.

---

### 🟡 SEO-2: No meta description tag

---

### 🟡 A11Y-1: Missing aria labels on icon buttons
**File:** [Header.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/components/Header/Header.tsx#L72-L74)

```tsx
<button className="...">
  <Heart size={20} className="text-primary" />
</button>
```

No `aria-label`, no visible text. Screen readers can't identify these buttons.

---

### 🟡 A11Y-2: Search input has no `<label>`
**File:** [Header.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/components/Header/Header.tsx#L61-L66)

---

### 🟡 A11Y-3: No skip-to-content link

---

## 8 · Summary & Priority Roadmap

### 🔴 Immediate Fixes (Do Now)

| # | Issue | Effort |
|---|-------|--------|
| S-1 | Remove `.env` from Git, rotate DB password | 15 min |
| S-2 | Fix CORS origin to match frontend port 3000 | 5 min |
| A-1 | Connect Checkout/Payment pages to `useCart()` | 2-3 hrs |
| A-3 | Fix `addToCart` field mismatch (`image` vs `imageUrl`, etc.) | 1 hr |

### 🟠 Short-Term (This Sprint)

| # | Issue | Effort |
|---|-------|--------|
| S-3 | Environment-based API URL | 30 min |
| S-4 | Move Gemini API usage to backend proxy | 2 hrs |
| A-2 | Persist cart to localStorage | 1 hr |
| P-1 | Clean up dead files | 30 min |
| P-2 | Fix dependency categorization | 15 min |
| F-1 | Add error states to all API-consuming components | 2 hrs |

### 🟡 Medium-Term (Next Sprint)

| # | Issue | Effort |
|---|-------|--------|
| F-5 | Extract monolithic pages into component files | 3-4 hrs |
| F-6 | Server-side price filtering | 2 hrs |
| PF-2 | Route-based code splitting with `React.lazy` | 1 hr |
| PF-3 | Add SWR/React Query for data fetching | 3-4 hrs |
| P-3 | Add ESLint + Prettier config | 1 hr |
| P-5 | Enable TypeScript strict mode, fix errors | 3-4 hrs |
| A-5 | De-duplicate Contact page navbar/footer | 1 hr |
| A-6 | Add navbar to support pages | 1 hr |

### 🟢 Long-Term (Backlog)

| # | Issue | Effort |
|---|-------|--------|
| P-4 | Add test infrastructure (Vitest + React Testing Library) | 1 day |
| B-4 | Implement real best-seller ranking from orders table | 2-3 days |
| A-4 | Build real authentication system | 3-5 days |
| S-5 | Add rate limiting, helmet, CSRF protection | 2-3 hrs |
| SEO-1/2 | Per-page titles and meta descriptions | 2 hrs |
| PF-1 | Image optimization (lazy loading, srcset) | 2-3 hrs |
| F-7 | Consolidate icon systems (Lucide OR Material Symbols) | 2 hrs |
