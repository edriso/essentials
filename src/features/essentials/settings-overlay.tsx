import type { ReactNode } from 'react';
import { Icon } from '@/components/icon';
import { Overlay } from '@/components/overlay';
import { ACCENTS } from '@/types/domain';
import { useEssentialsStore } from '@/store/essentials-store';

interface SettingsOverlayProps {
  onClose: () => void;
}

/** A small, calm settings panel: list size, intention, theme, accent. */
export function SettingsOverlay({ onClose }: SettingsOverlayProps) {
  const settings = useEssentialsStore((state) => state.settings);
  const setMax = useEssentialsStore((state) => state.setMax);
  const setTheme = useEssentialsStore((state) => state.setTheme);
  const setAccent = useEssentialsStore((state) => state.setAccent);
  const setShowIntention = useEssentialsStore((state) => state.setShowIntention);

  return (
    <Overlay ariaLabel="Settings" onClose={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 18,
          padding: '28px 26px 26px',
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 22,
          }}
        >
          <SectionLabel>Settings</SectionLabel>
          <button
            onClick={onClose}
            className="e-corner"
            type="button"
            aria-label="Close"
            style={{ position: 'static' }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <Field label={`How many essentials · ${settings.max}`}>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={settings.max}
            onChange={(event) => setMax(Number(event.target.value))}
            aria-label="How many essentials"
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--faint)' }}>Fewer is calmer.</p>
        </Field>

        <Field label="Intention line">
          <Toggle
            on={settings.showIntention}
            label="Show a daily intention"
            onChange={() => setShowIntention(!settings.showIntention)}
          />
        </Field>

        <Field label="Theme">
          <div role="group" style={{ display: 'flex', gap: 10 }}>
            {(['paper', 'dark'] as const).map((option) => (
              <Pill
                key={option}
                selected={settings.theme === option}
                onClick={() => setTheme(option)}
                label={option === 'paper' ? 'Paper' : 'Dark'}
              />
            ))}
          </div>
        </Field>

        <Field label="Accent">
          <div role="group" aria-label="Accent" style={{ display: 'flex', gap: 12 }}>
            {ACCENTS.map((color) => {
              const selected = settings.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  aria-pressed={selected}
                  aria-label={color}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: color,
                    border: `2px solid ${selected ? 'var(--ink)' : 'transparent'}`,
                    boxShadow: '0 0 0 1px var(--line)',
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>
    </Overlay>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--ui)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.13em',
        textTransform: 'uppercase',
        color: 'var(--faint)',
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: 'var(--ui)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--dim)',
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Pill({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'var(--ui)',
        fontSize: 14,
        background: selected ? 'var(--accent-soft)' : 'transparent',
        color: selected ? 'var(--accent)' : 'var(--dim)',
        border: `1px solid ${selected ? 'var(--accent)' : 'var(--line)'}`,
      }}
    >
      {label}
    </button>
  );
}

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={on}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--ink)',
        fontFamily: 'var(--ui)',
        fontSize: 15,
      }}
    >
      <span>{label}</span>
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          flexShrink: 0,
          background: on ? 'var(--accent)' : 'var(--surface-2)',
          border: '1px solid var(--line)',
          position: 'relative',
          transition: 'background .25s ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            insetInlineStart: on ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: on ? 'var(--on-accent)' : 'var(--faint)',
            transition: 'inset-inline-start .25s ease',
          }}
        />
      </span>
    </button>
  );
}
