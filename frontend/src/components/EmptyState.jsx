// Illustrated empty/blocked state used by the bag, wishlist, orders and 404.
export default function EmptyState({ illustration, title, children, actions }) {
  return (
    <div className="empty">
      {illustration}
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {actions && <div className="actions">{actions}</div>}
    </div>
  );
}
