import { describe, expect, it } from 'vitest';
import type { DaysState, Essential } from '@/types/domain';
import { isAllDone, isFull, orderEssentials, reconcile } from './essentials';

const NOW = new Date(2026, 2, 10, 12, 0, 0); // today key "2026-03-10"
const TODAY = '2026-03-10';
const TOMORROW = '2026-03-11';
const YESTERDAY = '2026-03-09';

function item(id: string, text: string, done = false, carried?: boolean): Essential {
  return carried === undefined ? { id, text, done } : { id, text, done, carried };
}

function state(partial: Partial<DaysState> = {}): DaysState {
  return { days: {}, intentions: {}, ...partial };
}

describe('reconcile', () => {
  it('leaves today and tomorrow untouched when there is nothing to carry', () => {
    const input = state({
      days: { [TODAY]: [item('a', 'Today thing')], [TOMORROW]: [item('b', 'Tomorrow thing')] },
      intentions: { [TODAY]: 'be kind' },
    });
    const out = reconcile(input, NOW);
    expect(out.days[TODAY]).toEqual([item('a', 'Today thing')]);
    expect(out.days[TOMORROW]).toEqual([item('b', 'Tomorrow thing')]);
    expect(out.intentions[TODAY]).toBe('be kind');
  });

  it('carries only the unfinished items from past days, tagged carried', () => {
    const input = state({
      days: { [YESTERDAY]: [item('a', 'Done one', true), item('b', 'Not done')] },
    });
    const out = reconcile(input, NOW);
    expect(out.days[YESTERDAY]).toBeUndefined();
    expect(out.days[TODAY]).toEqual([item('b', 'Not done', false, true)]);
  });

  it('prepends carried items before existing today items', () => {
    const input = state({
      days: {
        [YESTERDAY]: [item('a', 'From yesterday')],
        [TODAY]: [item('c', 'Already here')],
      },
    });
    const out = reconcile(input, NOW);
    expect(out.days[TODAY].map((e) => e.text)).toEqual(['From yesterday', 'Already here']);
  });

  it('dedupes carried items against today by case-insensitive text', () => {
    const input = state({
      days: {
        [YESTERDAY]: [item('a', '  CALL Mom ')],
        [TODAY]: [item('c', 'call mom')],
      },
    });
    const out = reconcile(input, NOW);
    expect(out.days[TODAY]).toHaveLength(1);
    expect(out.days[TODAY][0].id).toBe('c');
  });

  it('drops past days and their intentions', () => {
    const input = state({
      days: { [YESTERDAY]: [item('a', 'x', true)] },
      intentions: { [YESTERDAY]: 'old intention', [TODAY]: 'keep me' },
    });
    const out = reconcile(input, NOW);
    expect(out.days[YESTERDAY]).toBeUndefined();
    expect(out.intentions[YESTERDAY]).toBeUndefined();
    expect(out.intentions[TODAY]).toBe('keep me');
  });

  it('carries across a multi-day gap', () => {
    const input = state({
      days: {
        '2026-03-07': [item('a', 'three days ago')],
        '2026-03-08': [item('b', 'two days ago')],
      },
    });
    const out = reconcile(input, NOW);
    expect(out.days[TODAY].map((e) => e.text)).toEqual(['three days ago', 'two days ago']);
  });

  it('handles a month boundary', () => {
    const out = reconcile(
      state({ days: { '2026-02-28': [item('a', 'leftover')] } }),
      new Date(2026, 2, 1, 9, 0, 0),
    );
    expect(out.days['2026-03-01'].map((e) => e.text)).toEqual(['leftover']);
  });

  it('handles a year boundary', () => {
    const out = reconcile(
      state({ days: { '2025-12-31': [item('a', 'new year carry')] } }),
      new Date(2026, 0, 1, 0, 30, 0),
    );
    expect(out.days['2026-01-01'].map((e) => e.text)).toEqual(['new year carry']);
  });
});

describe('orderEssentials', () => {
  it('keeps unfinished items in insertion order and sinks done to the bottom', () => {
    const list = [
      item('a', 'one', true),
      item('b', 'two'),
      item('c', 'three', true),
      item('d', 'four'),
    ];
    expect(orderEssentials(list).map((e) => e.id)).toEqual(['b', 'd', 'a', 'c']);
  });
});

describe('isFull', () => {
  it('is true at or above the cap and false below it', () => {
    expect(isFull([item('a', 'x')], 3)).toBe(false);
    expect(isFull([item('a', 'x'), item('b', 'y'), item('c', 'z')], 3)).toBe(true);
    // Lowering max below an existing count still blocks adding.
    expect(isFull([item('a', 'x'), item('b', 'y')], 1)).toBe(true);
  });
});

describe('isAllDone', () => {
  it('is false for an empty list and true only when every item is done', () => {
    expect(isAllDone([])).toBe(false);
    expect(isAllDone([item('a', 'x', true), item('b', 'y')])).toBe(false);
    expect(isAllDone([item('a', 'x', true), item('b', 'y', true)])).toBe(true);
  });
});
