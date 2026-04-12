# Fix Architecture Issue A-1: Connect Checkout & Payment to Global Context

## Problem

The **Checkout** and **Payment** pages currently display hardcoded product cards (dummy data, like "Gilded Zari Shawl" or "The Empress Stole") inside the **Order Summary** sidebars. The prices and subtotals are completely static text. This means a user can add a "Red Scarf" to their cart, proceed to Checkout, and suddenly see "Empress Stole" for ₹42,500. 

## Proposed Changes

We need to dynamically drive these views by reading from the shared `CartContext` — using exactly the same logic that the `/cart` page currently uses to populate its list.

### 1. Checkout Page

#### [MODIFY] [Checkout/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Checkout/index.tsx)
- Import `useCart` from the global `CartContext`.
- Remove the hardcoded UI product elements (`Gilded Zari Shawl` & `Gold Thread`).
- Iterate over the `items` array to render the specific cart details (name, variant, dynamically formatted prices, and image thumbnails).
- Calculate financial summaries:
  - **Subtotal:** Dynamically sum the prices of all cart items `(price * quantity)`.
  - **Shipping:** Add dynamic state for the shipping radio buttons (Standard ₹80 vs Express ₹250).
  - **Total:** Bind the calculated `Total = Subtotal + Shipping`.

### 2. Payment Page

#### [MODIFY] [Payment/index.tsx](file:///c:/Users/user/Downloads/gilded-heirloom%20-%20Copy/src/pages/Payment/index.tsx)
- Apply the same layout loop to dynamically render the `items` from the cart.
- Calculate financial summaries matching the "Review" logic shown in the checkout page.
- Re-implement the GST calculation logic to be structurally linked instead of an arbitrary hardcoded sum (e.g. flat `12%` tax metric calculated programmatically as `Math.round(Subtotal * 0.12)`).
- **Total:** Bind the calculation to equal `Subtotal + Shipping (from previous state, fallback to 80 or Free) + GST`.

## Open Questions

- In the original Payment UI mockup you provided, "Artisan Shipping" dynamically changed to "Complimentary". Should we set shipping to **Free** if the subtotal goes above a certain threshold (e.g., ₹10,000), or would you prefer preserving the fixed ₹80 standard behavior across the pipeline?

## Verification Plan

### Manual Verification
1. Open the application and visit the `/shop` route.
2. Add a random item to your cart and navigate to `/cart`.
3. Proceed straight through to `/checkout`. Validate that exactly the correct item and total pricing persists dynamically.
4. Continue to `/payment` and validate the final breakdown accurately adds the 12% calculated GST on top of the original values.
