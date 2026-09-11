import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/useStore';
import EmptyState from './EmptyState';
import { LockedIllustration } from './Illustrations';

// Shows a friendly sign-in prompt instead of a raw 401 for bag/orders pages.
export default function RequireAuth({ children, what = 'this page' }) {
  const { isAuthed } = useStore();
  const location = useLocation();

  if (isAuthed) return children;

  return (
    <main className="page container">
      <EmptyState
        illustration={<LockedIllustration />}
        title="Sign in to continue"
        actions={(
          <>
            <Link className="btn btn-primary" to="/login" state={{ from: location.pathname }}>Sign in</Link>
            <Link className="btn btn-soft" to="/register" state={{ from: location.pathname }}>Create an account</Link>
          </>
        )}
      >
        You need an account to see {what}. It only takes a moment.
      </EmptyState>
    </main>
  );
}
