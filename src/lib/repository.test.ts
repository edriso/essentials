import { beforeEach, describe, expect, it } from 'vitest';
import { createLocalStorageRepository, type Repository } from './repository';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => Array.from(map.keys())[index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
}

const NOW = new Date(2026, 2, 10, 12, 0, 0);

describe('localStorage repository', () => {
  let repo: Repository;
  let storage: Storage;

  beforeEach(() => {
    storage = memoryStorage();
    repo = createLocalStorageRepository(storage);
  });

  it('returns sensible defaults when nothing is stored', () => {
    const state = repo.getState(NOW);
    expect(state.version).toBe(1);
    expect(state.settings.max).toBe(3);
    expect(state.settings.theme).toBe('paper');
    expect(state.days).toEqual({});
  });

  it('falls back to defaults on corrupt JSON', () => {
    storage.setItem('essentials-v1', 'not json');
    expect(repo.getState(NOW).settings.accent).toBe('#6f8a72');
  });

  it('falls back to defaults on a valid-JSON but wrong shape', () => {
    storage.setItem('essentials-v1', JSON.stringify({ version: 1, settings: {} }));
    expect(repo.getState(NOW).settings.max).toBe(3);
  });

  it('rejects an out-of-range max as a wrong shape', () => {
    storage.setItem(
      'essentials-v1',
      JSON.stringify({
        version: 1,
        settings: { max: 99, theme: 'dark', accent: '#6f8a72', showIntention: true },
        days: {},
        intentions: {},
      }),
    );
    expect(repo.getState(NOW).settings.max).toBe(3);
  });

  it('round-trips saved state', () => {
    repo.saveState({
      version: 1,
      settings: { max: 5, theme: 'dark', accent: '#6f86a3', showIntention: false },
      days: { '2026-03-10': [{ id: 'a', text: 'write', done: false }] },
      intentions: { '2026-03-10': 'focus' },
    });
    const out = repo.getState(NOW);
    expect(out.settings).toEqual({
      max: 5,
      theme: 'dark',
      accent: '#6f86a3',
      showIntention: false,
    });
    expect(out.days['2026-03-10'][0].text).toBe('write');
    expect(out.intentions['2026-03-10']).toBe('focus');
  });

  it('applies the carry-over on read', () => {
    repo.saveState({
      version: 1,
      settings: { max: 3, theme: 'paper', accent: '#6f8a72', showIntention: true },
      days: { '2026-03-09': [{ id: 'a', text: 'leftover', done: false }] },
      intentions: {},
    });
    const out = repo.getState(NOW);
    expect(out.days['2026-03-09']).toBeUndefined();
    expect(out.days['2026-03-10'][0]).toMatchObject({ text: 'leftover', carried: true });
  });
});
