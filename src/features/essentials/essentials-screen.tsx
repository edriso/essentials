import { useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import { addDays, keyOf, partOfDay } from '@/lib/date';
import { isAllDone, isFull, orderEssentials } from '@/lib/essentials';
import { useEssentialsStore } from '@/store/essentials-store';
import { EssentialItem } from './essential-item';

type View = 'today' | 'tomorrow';

const PART_LABEL: Record<ReturnType<typeof partOfDay>, string> = {
  morning: 'this morning',
  afternoon: 'this afternoon',
  evening: 'this evening',
};

/** The whole app: one calm column with Today / Tomorrow, the list, and states. */
export function EssentialsScreen() {
  const days = useEssentialsStore((state) => state.days);
  const intentions = useEssentialsStore((state) => state.intentions);
  const max = useEssentialsStore((state) => state.settings.max);
  const showIntention = useEssentialsStore((state) => state.settings.showIntention);
  const add = useEssentialsStore((state) => state.add);
  const toggle = useEssentialsStore((state) => state.toggle);
  const remove = useEssentialsStore((state) => state.remove);
  const setIntention = useEssentialsStore((state) => state.setIntention);

  const [view, setView] = useState<View>('today');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [editingIntention, setEditingIntention] = useState(false);

  const now = new Date();
  const dateForView = view === 'today' ? now : addDays(now, 1);
  const dayKey = keyOf(dateForView);

  const list = useMemo(() => days[dayKey] ?? [], [days, dayKey]);
  const ordered = useMemo(() => orderEssentials(list), [list]);
  const full = isFull(list, max);
  const allDone = isAllDone(list);
  const intention = intentions[dayKey] ?? '';

  function switchView(next: View) {
    setView(next);
    setAdding(false);
    setDraft('');
  }

  function commitAdd() {
    add(dayKey, draft);
    setDraft('');
    setAdding(false);
  }

  return (
    <>
      <header className="e-head">
        <div className="e-tabs">
          <button
            className={'e-tab' + (view === 'today' ? ' is-on' : '')}
            type="button"
            onClick={() => switchView('today')}
            aria-pressed={view === 'today'}
          >
            Today
          </button>
          <span className="e-tab-sep" aria-hidden="true">
            ·
          </span>
          <button
            className={'e-tab' + (view === 'tomorrow' ? ' is-on' : '')}
            type="button"
            onClick={() => switchView('tomorrow')}
            aria-pressed={view === 'tomorrow'}
          >
            Tomorrow
          </button>
        </div>

        <h1 className="e-date">
          {dateForView.toLocaleDateString(undefined, { weekday: 'long' })}
          <span className="e-date-sub">
            {dateForView.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </span>
        </h1>

        {showIntention && (
          <div className="e-intention">
            {editingIntention || intention ? (
              <input
                className="e-intention-input"
                value={intention}
                placeholder="an intention, if you like…"
                aria-label="Intention for the day"
                onChange={(event) => setIntention(dayKey, event.target.value)}
                onFocus={() => setEditingIntention(true)}
                onBlur={() => setEditingIntention(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
            ) : (
              <button
                className="e-intention-add"
                type="button"
                onClick={() => setEditingIntention(true)}
              >
                + set an intention
              </button>
            )}
          </div>
        )}
      </header>

      <section className="e-list">
        {ordered.length === 0 && !adding && (
          <div className="e-empty e-fade">
            <p className="e-empty-q">
              What matters {view === 'today' ? PART_LABEL[partOfDay(now)] : 'tomorrow'}?
            </p>
            <p className="e-empty-sub">Choose up to {max}. Just the few that truly count.</p>
          </div>
        )}

        {ordered.map((essential, index) => (
          <EssentialItem
            key={essential.id}
            essential={essential}
            isMain={index === 0 && !essential.done}
            onToggle={() => toggle(dayKey, essential.id)}
            onRemove={() => remove(dayKey, essential.id)}
          />
        ))}

        {adding ? (
          <div className="e-item e-adding e-fade">
            <span className="e-checkbtn">
              <span className="e-check e-check-ghost" />
            </span>
            <input
              className="e-text e-input"
              autoFocus
              value={draft}
              placeholder="name one essential…"
              aria-label="New essential"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitAdd();
                }
                if (event.key === 'Escape') {
                  setAdding(false);
                  setDraft('');
                }
              }}
              onBlur={commitAdd}
            />
          </div>
        ) : (
          !full && (
            <button className="e-add e-fade" type="button" onClick={() => setAdding(true)}>
              <span className="e-add-icon">
                <Icon name="plus" size={16} />
              </span>
              add an essential
            </button>
          )
        )}
      </section>

      <footer className="e-foot">
        {allDone ? (
          <div className="e-done-note e-fade">
            <Icon name="leaf" size={20} style={{ color: 'var(--accent)' }} />
            <span>That’s everything. Rest now.</span>
          </div>
        ) : full ? (
          <div className="e-full-note e-fade">{max} is enough. Focus here.</div>
        ) : null}
      </footer>
    </>
  );
}
