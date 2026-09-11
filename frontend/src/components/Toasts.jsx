import { useStore } from '../context/useStore';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './Icons';

const icons = { success: CheckIcon, danger: AlertIcon, info: InfoIcon };

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || InfoIcon;
        return (
          <div key={toast.id} className={`toast ${toast.type}`} role="status">
            <Icon />
            <span>{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
              <CloseIcon width="16" height="16" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
