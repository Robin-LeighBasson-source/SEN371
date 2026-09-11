import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { request } from '../api';
import { StoreContext } from './useStore';

// One place for everything that has to be shared between the header and the
// pages: who is signed in, what is in the bag and wishlist, and toasts.
const TOKEN_KEY = 'token';

function readToken() {
  try {
    const saved = localStorage.getItem(TOKEN_KEY);
    return saved && saved !== 'null' ? saved : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /* ---------- toasts ---------- */
  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = 'success') => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => dismissToast(id), 3500);
  }, [dismissToast]);

  /* ---------- auth ---------- */
  const signIn = useCallback((newToken, newUser) => {
    try { localStorage.setItem(TOKEN_KEY, newToken); } catch { /* storage unavailable */ }
    setToken(newToken);
    if (newUser) setUser(newUser);
  }, []);

  const signOut = useCallback((silent = false) => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
    setToken(null);
    setUser(null);
    setCart(null);
    setWishlist(null);
    if (!silent) notify('You have been signed out', 'info');
  }, [notify]);

  // Wraps a request so an expired/invalid token signs the shopper out instead
  // of every page having to handle a 401 on its own.
  const authed = useCallback(async (path, options) => {
    try {
      return await request(path, token, options);
    } catch (error) {
      if (error.status === 401) signOut(true);
      throw error;
    }
  }, [token, signOut]);

  // Load the profile, bag and wishlist whenever the token changes.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.allSettled([
      request('/api/auth/me', token),
      request('/api/cart', token),
      request('/api/wishlist', token),
    ]).then(([me, cartResult, wishlistResult]) => {
      if (cancelled) return;
      if (me.status === 'rejected' && me.reason?.status === 401) {
        signOut(true);
        return;
      }
      if (me.status === 'fulfilled') setUser(me.value.user);
      if (cartResult.status === 'fulfilled') setCart(cartResult.value.cart);
      if (wishlistResult.status === 'fulfilled') setWishlist(wishlistResult.value.wishlist);
    });

    return () => { cancelled = true; };
  }, [token, signOut]);

  /* ---------- cart ---------- */
  const addToCart = useCallback(async (product, quantity = 1) => {
    const data = await authed('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ product_id: product._id, quantity }),
    });
    setCart(data.cart);
    notify(`${product.name} added to your bag`);
    return data.cart;
  }, [authed, notify]);

  const updateCartItem = useCallback(async (productId, quantity) => {
    const data = await authed(`/api/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    setCart(data.cart);
    return data.cart;
  }, [authed]);

  const removeCartItem = useCallback(async (productId) => {
    const data = await authed(`/api/cart/items/${productId}`, { method: 'DELETE' });
    setCart(data.cart);
    return data.cart;
  }, [authed]);

  const clearCart = useCallback(async () => {
    const data = await authed('/api/cart', { method: 'DELETE' });
    setCart(data.cart);
    return data.cart;
  }, [authed]);

  const refreshCart = useCallback(async () => {
    const data = await authed('/api/cart');
    setCart(data.cart);
    return data.cart;
  }, [authed]);

  /* ---------- wishlist ---------- */
  const wishlistIds = useMemo(
    () => new Set((wishlist?.products ?? []).map((product) => product._id)),
    [wishlist],
  );

  const toggleWishlist = useCallback(async (product) => {
    const saved = wishlistIds.has(product._id);
    const data = saved
      ? await authed(`/api/wishlist/items/${product._id}`, { method: 'DELETE' })
      : await authed('/api/wishlist', { method: 'POST', body: JSON.stringify({ product_id: product._id }) });
    setWishlist(data.wishlist);
    notify(saved ? `${product.name} removed from saved items` : `${product.name} saved for later`);
    return !saved;
  }, [authed, notify, wishlistIds]);

  const removeFromWishlist = useCallback(async (product) => {
    const data = await authed(`/api/wishlist/items/${product._id}`, { method: 'DELETE' });
    setWishlist(data.wishlist);
    return data.wishlist;
  }, [authed]);

  const moveToCart = useCallback(async (product) => {
    const data = await authed(`/api/wishlist/items/${product._id}/move-to-cart`, { method: 'POST' });
    setWishlist(data.wishlist);
    setCart(data.cart);
    notify(`${product.name} moved to your bag`);
    return data;
  }, [authed, notify]);

  const cartCount = useMemo(
    () => (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const value = useMemo(() => ({
    token, user, isAuthed: Boolean(token),
    signIn, signOut, authed,
    cart, cartCount, addToCart, updateCartItem, removeCartItem, clearCart, refreshCart, setCart,
    wishlist, wishlistIds, toggleWishlist, removeFromWishlist, moveToCart,
    toasts, notify, dismissToast,
  }), [
    token, user, signIn, signOut, authed,
    cart, cartCount, addToCart, updateCartItem, removeCartItem, clearCart, refreshCart,
    wishlist, wishlistIds, toggleWishlist, removeFromWishlist, moveToCart,
    toasts, notify, dismissToast,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
