// Every API call goes through here so the base URL, the auth header and the
// error handling are written once instead of in every page.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function parse(response) {
  const data = await response.json().catch(() => ({}));

  // The backend answers with { success, message } on failure, so the message
  // it sends is shown to the shopper as-is.
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    throw error;
  }

  return data;
}

// Authenticated request. `token` may be null for public endpoints.
export async function request(path, token, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  return parse(response);
}

// Public GET helper that supports cancellation for list pages.
export async function get(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, { signal });
  return parse(response);
}

// Prices are stored as whole cents in the database to avoid rounding errors.
export const formatRands = (cents) =>
  `R ${(Number(cents || 0) / 100).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function primaryImage(product) {
  const primary = product?.images?.find((image) => image.is_primary);
  return primary?.image_url || product?.images?.[0]?.image_url || '';
}

export const productPath = (product) => `/products/${encodeURIComponent(product.sku)}`;
