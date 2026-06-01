import { Icon } from '@/components/icon';
import type { Essential } from '@/types/domain';

interface EssentialItemProps {
  essential: Essential;
  /** The top unfinished item is "the one" — rendered larger as the main focus. */
  isMain: boolean;
  onToggle: () => void;
  onRemove: () => void;
}

export function EssentialItem({ essential, isMain, onToggle, onRemove }: EssentialItemProps) {
  const className =
    'e-item e-fade' + (essential.done ? ' is-done' : '') + (isMain ? ' is-main' : '');

  return (
    <div className={className}>
      <button
        className="e-checkbtn"
        type="button"
        onClick={onToggle}
        role="checkbox"
        aria-checked={essential.done}
        aria-label={essential.text}
      >
        <span className="e-check">
          {essential.done && <Icon name="check" size={isMain ? 19 : 16} stroke={2} />}
        </span>
      </button>
      <button className="e-text" type="button" onClick={onToggle} tabIndex={-1}>
        <span>{essential.text}</span>
        {essential.carried && !essential.done && <span className="e-carried">carried over</span>}
      </button>
      <button
        className="e-remove"
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${essential.text}`}
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}
