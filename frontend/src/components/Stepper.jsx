import { MinusIcon, PlusIcon } from './Icons';

export default function Stepper({ value, onChange, min = 1, max = 99, size, disabled }) {
  return (
    <div className={`stepper${size === 'sm' ? ' sm' : ''}`} role="group" aria-label="Quantity">
      <button type="button" onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        <MinusIcon width="16" height="16" />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        <PlusIcon width="16" height="16" />
      </button>
    </div>
  );
}
