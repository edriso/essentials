import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { createDefaultState } from '@/lib/repository';
import { useEssentialsStore } from '@/store/essentials-store';

function reset() {
  localStorage.clear();
  const defaults = createDefaultState();
  useEssentialsStore.setState({
    settings: defaults.settings,
    days: defaults.days,
    intentions: defaults.intentions,
  });
}

beforeEach(reset);

async function addEssential(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByRole('button', { name: 'add an essential' }));
  const input = screen.getByLabelText('New essential');
  await user.type(input, `${text}{Enter}`);
}

describe('empty state', () => {
  it('asks what matters and how many to choose', () => {
    render(<App />);
    expect(screen.getByText(/What matters this (morning|afternoon|evening)\?/)).toBeInTheDocument();
    expect(screen.getByText('Choose up to 3. Just the few that truly count.')).toBeInTheDocument();
  });
});

describe('adding and the cap', () => {
  it('reveals an input and adds an essential on Enter', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addEssential(user, 'Write the letter');
    expect(screen.getByText('Write the letter')).toBeInTheDocument();
  });

  it('hides "add" and shows the calm note at the cap', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addEssential(user, 'One');
    await addEssential(user, 'Two');
    await addEssential(user, 'Three');

    expect(screen.queryByRole('button', { name: 'add an essential' })).not.toBeInTheDocument();
    expect(screen.getByText('3 is enough. Focus here.')).toBeInTheDocument();
  });
});

describe('completing', () => {
  it('shows the rest note once everything is done', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addEssential(user, 'Only thing');

    await user.click(screen.getByRole('checkbox', { name: 'Only thing' }));
    expect(screen.getByText(/Rest now/)).toBeInTheDocument();
  });
});

describe('Today / Tomorrow', () => {
  it('keeps separate lists per view', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addEssential(user, 'Today task');

    await user.click(screen.getByRole('button', { name: 'Tomorrow' }));
    // Tomorrow starts empty.
    expect(screen.queryByText('Today task')).not.toBeInTheDocument();
    expect(screen.getByText(/What matters tomorrow\?/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByText('Today task')).toBeInTheDocument();
  });
});

describe('settings', () => {
  it('toggles the theme on the document element', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('paper');
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('lowers the cap from the settings panel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    fireEvent.change(screen.getByLabelText('How many essentials'), { target: { value: '1' } });
    expect(useEssentialsStore.getState().settings.max).toBe(1);
  });
});
