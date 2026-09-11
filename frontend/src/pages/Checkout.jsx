import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRands, primaryImage } from '../api';
import { useStore } from '../context/useStore';
import EmptyState from '../components/EmptyState';
import { ArrowRight, CheckIcon, ChevronLeft, LockIcon } from '../components/Icons';
import { EmptyBagIllustration, ImagePlaceholder, OrderSuccessIllustration } from '../components/Illustrations';
import { cartTotals } from '../totals';

const STEPS = ['Delivery', 'Payment', 'Review'];

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

const initialForm = {
  fullName: '', email: '', phone: '',
  address: '', apartment: '', city: '', province: 'Gauteng', postalCode: '',
  method: 'card', cardName: '', cardNumber: '', expiry: '', cvc: '',
};

function CardGlyph() {
  return (
    <svg viewBox="0 0 40 26" aria-hidden="true"><rect width="40" height="26" rx="5" fill="#14213d" /><rect x="6" y="8" width="10" height="7" rx="2" fill="#f4a11d" /><rect x="6" y="18" width="20" height="3" rx="1.5" fill="#fff" opacity="0.7" /></svg>
  );
}
function EftGlyph() {
  return (
    <svg viewBox="0 0 40 26" aria-hidden="true"><rect width="40" height="26" rx="5" fill="#dce6f5" /><path d="M10 18h20M13 18v-7M20 18v-7M27 18v-7M8 11l12-5 12 5" stroke="#14213d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
  );
}

// Formats card number with spaces as the shopper types; purely cosmetic.
const formatCard = (value) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export default function Checkout() {
  const { cart, user, refreshCart, authed, setCart, notify } = useStore();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(!cart);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(null);

  useEffect(() => {
    let active = true;
    refreshCart().catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [refreshCart]);

  // Pre-fill the contact details once the signed-in profile is known. Done
  // during render (React's "adjust state on prop change" pattern) rather than
  // in an effect so there is no extra render with an empty form.
  const [seededFor, setSeededFor] = useState(null);
  if (user && seededFor !== user._id) {
    setSeededFor(user._id);
    setForm((current) => ({
      ...current,
      fullName: current.fullName || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: current.email || user.email || '',
    }));
  }

  const items = (cart?.items ?? []).filter((item) => item.product_id);
  const { subtotal, shipping, total } = cartTotals(items);

  const set = (event) => {
    const { name, value } = event.target;
    const formatted = name === 'cardNumber' ? formatCard(value) : name === 'expiry' ? formatExpiry(value) : value;
    setForm((current) => ({ ...current, [name]: formatted }));
  };

  const next = (event) => { event.preventDefault(); setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const placeOrder = async () => {
    setSubmitting(true);
    setError('');
    try {
      const created = await authed('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shipping: {
            full_name: form.fullName,
            email: form.email,
            street_address: [form.address, form.apartment].filter(Boolean).join(', '),
            city: `${form.city}, ${form.province}`,
            postal_code: form.postalCode,
          },
        }),
      });
      const paid = await authed(`/api/orders/${created.order._id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ payment_method: form.method === 'card' ? 'Credit Card' : 'EFT' }),
      });
      setCompleted(paid.order || created.order);
      setCart({ ...(cart || {}), items: [] });
      notify('Order placed — thank you!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="page container"><div className="loading-block"><span className="spinner" /> Preparing checkout…</div></main>;

  if (completed) {
    return (
      <main className="page container">
        <div className="success-wrap">
          <OrderSuccessIllustration />
          <span className="eyebrow">Order confirmed</span>
          <h1>Thanks, {form.fullName.split(' ')[0] || 'friend'}!</h1>
          <p className="muted">We've emailed a confirmation to <b>{form.email}</b>. Your gear will be with you in 2–4 working days.</p>
          <span className="order-ref">Order #{completed._id}</span>
          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn btn-primary">View my orders</Link>
            <Link to="/products" className="btn btn-soft">Keep shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="page container">
        <EmptyState illustration={<EmptyBagIllustration />} title="Nothing to check out" actions={<Link to="/products" className="btn btn-primary">Browse products <ArrowRight /></Link>}>
          Your bag is empty. Add something first and come back.
        </EmptyState>
      </main>
    );
  }

  return (
    <main className="page container">
      <div className="page-head">
        <div><span className="eyebrow">Checkout</span><h1 style={{ margin: 0 }}>Almost there</h1></div>
        <Link to="/cart" className="link small">← Back to bag</Link>
      </div>

      <ol className="steps" aria-label="Checkout progress">
        {STEPS.map((label, index) => (
          <li key={label} className="row" style={{ gap: 8 }}>
            <span className={`step${index === step ? ' active' : index < step ? ' done' : ''}`} aria-current={index === step ? 'step' : undefined}>
              <span className="num">{index < step ? <CheckIcon width="14" height="14" /> : index + 1}</span>
              <span className="lbl">{label}</span>
            </span>
            {index < STEPS.length - 1 && <span className="step-sep" />}
          </li>
        ))}
      </ol>

      <div className="cart-layout">
        <div className="panel">
          {error && <div className="alert alert-danger">{error}</div>}

          {step === 0 && (
            <form onSubmit={next}>
              <h3>Where should we send it?</h3>
              <div className="form-row">
                <div className="field"><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" className="input" value={form.fullName} onChange={set} required autoComplete="name" /></div>
                <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" className="input" value={form.phone} onChange={set} placeholder="082 000 0000" autoComplete="tel" /></div>
              </div>
              <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" className="input" value={form.email} onChange={set} required autoComplete="email" /></div>
              <div className="field"><label htmlFor="address">Street address</label><input id="address" name="address" className="input" value={form.address} onChange={set} required autoComplete="address-line1" placeholder="12 Long Street" /></div>
              <div className="field"><label htmlFor="apartment">Apartment, unit, complex <span className="muted">(optional)</span></label><input id="apartment" name="apartment" className="input" value={form.apartment} onChange={set} autoComplete="address-line2" /></div>
              <div className="form-row thirds">
                <div className="field"><label htmlFor="city">City</label><input id="city" name="city" className="input" value={form.city} onChange={set} required autoComplete="address-level2" /></div>
                <div className="field"><label htmlFor="province">Province</label>
                  <select id="province" name="province" className="select" value={form.province} onChange={set}>
                    {PROVINCES.map((province) => <option key={province}>{province}</option>)}
                  </select>
                </div>
                <div className="field"><label htmlFor="postalCode">Postal code</label><input id="postalCode" name="postalCode" className="input" value={form.postalCode} onChange={set} required inputMode="numeric" autoComplete="postal-code" /></div>
              </div>
              <div className="row between" style={{ marginTop: 8 }}>
                <span className="small muted">Delivery within South Africa only</span>
                <button type="submit" className="btn btn-primary">Continue to payment <ArrowRight /></button>
              </div>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={next}>
              <h3>How would you like to pay?</h3>
              <div className="alert alert-info"><LockIcon /> This is a demo store — no real payment is taken. Any card details are accepted.</div>
              <label className={`pay-option${form.method === 'card' ? ' active' : ''}`}>
                <input type="radio" name="method" value="card" checked={form.method === 'card'} onChange={set} />
                <span><b>Credit or debit card</b><span>Visa, Mastercard, American Express</span></span>
                <CardGlyph />
              </label>
              <label className={`pay-option${form.method === 'eft' ? ' active' : ''}`}>
                <input type="radio" name="method" value="eft" checked={form.method === 'eft'} onChange={set} />
                <span><b>Instant EFT</b><span>Pay straight from your bank</span></span>
                <EftGlyph />
              </label>

              {form.method === 'card' && (
                <div style={{ marginTop: 18 }}>
                  <div className="field"><label htmlFor="cardName">Name on card</label><input id="cardName" name="cardName" className="input" value={form.cardName} onChange={set} required autoComplete="cc-name" /></div>
                  <div className="field"><label htmlFor="cardNumber">Card number</label><input id="cardNumber" name="cardNumber" className="input" value={form.cardNumber} onChange={set} required inputMode="numeric" placeholder="4242 4242 4242 4242" autoComplete="cc-number" /></div>
                  <div className="form-row">
                    <div className="field"><label htmlFor="expiry">Expiry</label><input id="expiry" name="expiry" className="input" value={form.expiry} onChange={set} required placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" /></div>
                    <div className="field"><label htmlFor="cvc">Security code</label><input id="cvc" name="cvc" className="input" value={form.cvc} onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} required placeholder="CVC" inputMode="numeric" autoComplete="cc-csc" /></div>
                  </div>
                </div>
              )}

              <div className="row between" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={back}><ChevronLeft /> Back</button>
                <button type="submit" className="btn btn-primary">Review order <ArrowRight /></button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <h3>Check everything looks right</h3>
              <div className="review-block">
                <div className="row"><h4>Deliver to</h4><button type="button" className="link link-btn small" onClick={() => setStep(0)}>Edit</button></div>
                <p>{form.fullName}<br />{[form.address, form.apartment].filter(Boolean).join(', ')}<br />{form.city}, {form.province}, {form.postalCode}<br />{form.email}{form.phone && ` · ${form.phone}`}</p>
              </div>
              <div className="review-block">
                <div className="row"><h4>Payment</h4><button type="button" className="link link-btn small" onClick={() => setStep(1)}>Edit</button></div>
                <p>{form.method === 'card' ? `Card ending in ${form.cardNumber.replace(/\s/g, '').slice(-4) || '••••'}` : 'Instant EFT'}</p>
              </div>
              <div className="review-block">
                <div className="row"><h4>Items</h4><Link to="/cart" className="link small">Edit bag</Link></div>
                <div className="mini-lines">
                  {items.map((item) => {
                    const image = primaryImage(item.product_id);
                    return (
                      <div key={item._id} className="mini-line">
                        <span className="thumb">{image ? <img src={image} alt="" /> : <ImagePlaceholder />}<span className="qty">{item.quantity}</span></span>
                        <span className="name">{item.product_id.name}</span>
                        <b>{formatRands(item.product_id.price_cents * item.quantity)}</b>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="row between" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={back}><ChevronLeft /> Back</button>
                <button type="button" className="btn btn-primary btn-lg" onClick={placeOrder} disabled={submitting}>
                  {submitting ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff' }} /> Placing order…</> : <>Place order · {formatRands(total)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="panel summary" aria-label="Order summary">
          <h3>Order summary</h3>
          <div className="mini-lines">
            {items.map((item) => {
              const image = primaryImage(item.product_id);
              return (
                <div key={item._id} className="mini-line">
                  <span className="thumb">{image ? <img src={image} alt="" /> : <ImagePlaceholder />}<span className="qty">{item.quantity}</span></span>
                  <span className="name">{item.product_id.name}</span>
                  <b>{formatRands(item.product_id.price_cents * item.quantity)}</b>
                </div>
              );
            })}
          </div>
          <hr className="divider" />
          <div className="summary-line"><span>Subtotal</span><span>{formatRands(subtotal)}</span></div>
          <div className="summary-line"><span>Delivery</span><span>{shipping === 0 ? <span className="badge badge-success">Free</span> : formatRands(shipping)}</span></div>
          <div className="summary-line total"><span>Total</span><span>{formatRands(total)}</span></div>
          <div className="trust"><LockIcon /> Encrypted &amp; secure · VAT included</div>
        </aside>
      </div>
    </main>
  );
}
