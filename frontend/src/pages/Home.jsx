import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api';
import { BRAND } from '../brand';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ArrowRight } from '../components/Icons';
import { CategoryIcon, HeadsetIcon, HeroIllustration, RefreshIcon, ShieldIcon, TruckIcon } from '../components/Illustrations';

const VALUES = [
  { Icon: TruckIcon, title: 'Fast, tracked delivery', text: '2–4 working days anywhere in SA.' },
  { Icon: ShieldIcon, title: 'Secure checkout', text: 'Your details are encrypted end to end.' },
  { Icon: RefreshIcon, title: '30-day returns', text: 'Changed your mind? Send it back, no fuss.' },
  { Icon: HeadsetIcon, title: 'Real human support', text: 'Talk to people who use this gear daily.' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      get('/api/products?limit=8', controller.signal),
      get('/api/categories', controller.signal),
    ]).then(([productsResult, categoriesResult]) => {
      if (controller.signal.aborted) return;
      if (productsResult.status === 'fulfilled') setProducts(productsResult.value.products || []);
      else setError(productsResult.reason?.message || 'Could not load products');
      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value.categories || []);
      setLoading(false);
    });
    return () => controller.abort();
  }, []);

  return (
    <main className="page container">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">New season · {new Date().getFullYear()}</span>
          <h1>Gear that makes your <em>desk</em> feel like home.</h1>
          <p>{BRAND.tagline} Keyboards, displays and audio picked by people who spend all day at theirs.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">Shop the catalog <ArrowRight /></Link>
            <Link to="/products?search=keyboard" className="btn btn-soft btn-lg">Browse keyboards</Link>
          </div>
          <div className="hero-stats">
            <div><b>2–4 days</b><span>nationwide delivery</span></div>
            <div><b>30 days</b><span>hassle-free returns</span></div>
            <div><b>4.9 / 5</b><span>average rating</span></div>
          </div>
        </div>
        <div className="hero-art"><HeroIllustration /></div>
      </section>

      {categories.length > 0 && (
        <section className="section" aria-labelledby="cats">
          <div className="section-head">
            <div><h2 id="cats">Shop by category</h2><p>Find the right piece for your setup.</p></div>
            <Link to="/products" className="link">View all</Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link key={category._id} to={`/products?category=${category._id}`} className="category-tile">
                <span className="tile-icon"><CategoryIcon category={category} /></span>
                <span><b>{category.name}</b><span>{category.description || 'Explore the range'}</span></span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="featured">
        <div className="section-head">
          <div><h2 id="featured">Latest arrivals</h2><p>Fresh on the shelf this week.</p></div>
          <Link to="/products" className="link">See everything</Link>
        </div>
        {error && <div className="alert alert-danger">{error}. Is the API running on port 5000?</div>}
        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
        {!loading && !error && products.length === 0 && (
          <div className="alert alert-info">No products yet. Run <code>node seed.js</code> in the backend folder to add some.</div>
        )}
      </section>

      <section className="section">
        <div className="value-grid">
          {VALUES.map(({ Icon, title, text }) => (
            <div className="value-item" key={title}>
              <Icon />
              <div><b>{title}</b><span>{text}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="promo">
          <div>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Members</span>
            <h2>Create an account, keep a wishlist.</h2>
            <p>Save the gear you're eyeing, check out faster and keep every order in one place.</p>
          </div>
          <Link to="/register" className="btn btn-accent btn-lg">Create free account <ArrowRight /></Link>
        </div>
      </section>
    </main>
  );
}
