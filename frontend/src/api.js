// Every cart/wishlist call goes through here so the base URL, the auth header
// and the error handling are written once instead of in every page.
const API_BASE = 'http://localhost:5000';

export async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  // The backend always answers with { success, message } on failure, so the
  // message it sends is shown to the shopper as-is.
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// Prices are stored as whole cents in the database to avoid rounding errors.
export const formatRands = (cents) => `R ${(cents / 100).toFixed(2)}`;
