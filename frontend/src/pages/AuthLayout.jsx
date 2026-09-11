import { BRAND } from '../brand';
import { StorefrontIllustration } from '../components/Illustrations';

// Shared split layout for the sign-in and register screens.
export default function AuthLayout({ heading, blurb, children }) {
  return (
    <main className="auth">
      <section className="auth-art" aria-hidden="true">
        <StorefrontIllustration />
        <h2>{heading}</h2>
        <p>{blurb}</p>
      </section>
      <section className="auth-form">
        <div>{children}</div>
      </section>
      <span className="sr-only">{BRAND.fullName}</span>
    </main>
  );
}
