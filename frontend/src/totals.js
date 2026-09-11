// Order maths shared by the bag and checkout so both show the same numbers.
// Delivery is free on every order: the backend computes an order's total from
// the cart alone, so any client-side fee would disagree with order history.
export const FREE_SHIPPING_CENTS = 0;

export function cartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + (item.product_id?.price_cents ?? 0) * item.quantity, 0);
  const shipping = 0;
  return { subtotal, shipping, total: subtotal + shipping };
}
