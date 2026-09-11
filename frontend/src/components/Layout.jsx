import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { BRAND } from '../brand';
import { useStore } from '../context/useStore';
import { BagIcon, CloseIcon, HeartIcon, LogoutIcon, MenuIcon, PackageIcon, SearchIcon, UserIcon } from './Icons';
import { LogoMark, PaymentGlyphs } from './Illustrations';
import Toasts from './Toasts';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Shop' },
  { to: '/wishlist', label: 'Saved' },
  { to: '/orders', label: 'Orders' },
];

// Remounted by the parent (via `key`) whenever the URL's search term changes,
// so the box always starts from the current query without syncing in an effect.
function SearchBox({ initial = '', onSubmit }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    const query = value.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
    onSubmit?.();
  };

  return (
    <form className="header-search" role="search" onSubmit={submit}>
      <SearchIcon />
      <input
        className="input"
        type="search"
        placeholder="Search keyboards, monitors, audio…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search products"
      />
    </form>
  );
}

function AccountMenu() {
  const { user, signOut } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : '';

  return (
    <div className="account" ref={ref}>
      <button type="button" className="btn-icon" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
        {initials ? <b style={{ fontSize: 12 }}>{initials}</b> : <UserIcon />}
      </button>
      {open && (
        <div className="account-menu" role="menu">
          <div className="who">
            <b>{user ? `${user.first_name} ${user.last_name}` : 'Signed in'}</b>
            <span>{user?.email}</span>
          </div>
          <Link to="/orders" role="menuitem" onClick={() => setOpen(false)}><PackageIcon /> My orders</Link>
          <Link to="/wishlist" role="menuitem" onClick={() => setOpen(false)}><HeartIcon /> Saved items</Link>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); signOut(); navigate('/'); }}>
            <LogoutIcon /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { isAuthed, cartCount, wishlistIds } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [params] = useSearchParams();
  const search = params.get('search') || '';
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="announce"><b>Free delivery</b> on every order · 30-day returns on everything</div>
      <header className="header">
        <div className="container header-inner">
          <button type="button" className="btn-icon menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <Link to="/" className="brand" onClick={closeMenu} aria-label={`${BRAND.name} home`}>
            <LogoMark /> {BRAND.name}
          </Link>
          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>{item.label}</NavLink>
            ))}
          </nav>
          <SearchBox key={search} initial={search} />
          <div className="header-actions">
            <Link to="/wishlist" className="btn-icon" onClick={closeMenu} aria-label={`Saved items, ${wishlistIds.size} saved`}>
              <HeartIcon />
              {wishlistIds.size > 0 && <span className="count">{wishlistIds.size}</span>}
            </Link>
            <Link to="/cart" className="btn-icon" onClick={closeMenu} aria-label={`Bag, ${cartCount} items`}>
              <BagIcon />
              {cartCount > 0 && <span className="count">{cartCount}</span>}
            </Link>
            {isAuthed ? <AccountMenu /> : <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>}
          </div>
        </div>
        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile">
            <SearchBox key={`m-${search}`} initial={search} onSubmit={closeMenu} />
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={closeMenu}>{item.label}</NavLink>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

export function Footer() {
  const { notify } = useStore();
  const [email, setEmail] = useState('');

  const subscribe = (event) => {
    event.preventDefault();
    notify(`Thanks — we'll keep ${email} posted`);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="brand"><LogoMark /> {BRAND.name}</div>
            <p>{BRAND.tagline} Proudly shipped from Pretoria to every corner of South Africa.</p>
            <form className="newsletter" onSubmit={subscribe}>
              <input type="email" required placeholder="Email for new drops" value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Email address" />
              <button type="submit" className="btn btn-accent btn-sm">Join</button>
            </form>
          </div>
          <div>
            <h4>Shop</h4>
            <ul>
              <li><Link to="/products">All products</Link></li>
              <li><Link to="/products?search=keyboard">Keyboards</Link></li>
              <li><Link to="/products?search=monitor">Monitors</Link></li>
              <li><Link to="/products?search=headphones">Audio</Link></li>
            </ul>
          </div>
          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/orders">Order history</Link></li>
              <li><Link to="/wishlist">Saved items</Link></li>
              <li><Link to="/cart">Your bag</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <h4>Help</h4>
            <ul>
              <li><a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></li>
              <li><button type="button" onClick={() => notify('Delivery: 2–4 working days nationwide', 'info')}>Delivery &amp; returns</button></li>
              <li><button type="button" onClick={() => notify('Payments are simulated in this demo', 'info')}>Payment options</button></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {BRAND.fullName} · SEN371 project</span>
          <div className="pay-icons" aria-label="Accepted payment methods"><PaymentGlyphs /></div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();

  // Start each page at the top; the browser would otherwise keep the old scroll.
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <Toasts />
    </>
  );
}
