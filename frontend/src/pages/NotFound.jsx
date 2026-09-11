import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { NotFoundIllustration } from '../components/Illustrations';

export default function NotFound() {
  return (
    <main className="page container">
      <EmptyState
        illustration={<NotFoundIllustration />}
        title="This page came unplugged"
        actions={(<><Link to="/" className="btn btn-primary">Go home</Link><Link to="/products" className="btn btn-soft">Browse products</Link></>)}
      >
        The link may be broken or the page may have moved.
      </EmptyState>
    </main>
  );
}
